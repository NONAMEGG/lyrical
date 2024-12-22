<template>
  <body>
  <Header></Header>
  <div class="main_container">
    <div class="left_right_container">
      <div class="left_container">
        <h2>Рейтинг артистов</h2>
        <div class="most_rated_artists" v-if="mostRatedArtists.length != 0">
          
          <div v-for="artist in mostRatedArtists" :key="artist.id">
            <router-link class="link search_song_link" :to="`/artist/${artist.id}`">{{ artist.name }} {{ artist.rating }}</router-link>
            <span @click="likeArtist(artist.id)"> like</span>
          </div>

        </div>
        <div v-else>
          Рейтингов нет
        </div>
      </div>
      <div class="right_container">
        <h2>Рейтинг песен</h2>
        <div class="most_rated_songs" v-if="mostRatedSongs.length != 0">
          <div v-for="song in mostRatedSongs" :key="song.id">
            <router-link class="link search_song_link" :to="`/lyrics/${song.id}`">{{ song.name }}</router-link> {{ song.rating }}
            <span @click="likeSong(song.id)">like</span>
          </div>
          
        </div>
        <div v-else>
          Рейтингов нет
        </div>
      </div>
      
    </div>
    <div class="bottom_container">
      <h2>Новые песни</h2>
      <div class="recently_added_songs" v-if="recentlyAddedSongs.length != 0">
          <div class="link search_song_link" :to="`/lyrics/${song.id}`"  v-for="song in recentlyAddedSongs" :key="song.id">
            <router-link class="link search_song_link" :to="`/lyrics/${song.id}`">{{ song.name }} <br> {{ song.description }}</router-link> {{ song.rating }}
          <span @click="likeRecentSong(song.id)">like</span>
        </div>
        </div>
        <div v-else>
          Не было добавлено новых песен :(( shame
        </div>
    </div>
  </div>
</body>
</template>
  
  <script>
  import Header from '../components/header.vue';
  import { ref, inject } from 'vue';
  import { fetchMostRatedArtists, fetchMostRatedSongs, fetchResentlyAddedSongs, likeDislikeSong,
    getSongsRatings, likeDislikeArtist, getArtistsRatings } from '../lib/common_methods';
  export default {
    components: {
      Header
    },
    setup() {
      const isAuthenticated = inject('isAuthenticated');
      const user = inject('user');
      const mostRatedArtists = ref([]);
      const mostRatedSongs = ref([]);
      const recentlyAddedSongs = ref([]);
      const isLiked = ref(false);
      const getRatings = async () => {
        try {
          const artistsData =  await fetchMostRatedArtists();
        mostRatedArtists.value = artistsData;
        const songsData = await fetchMostRatedSongs();
        mostRatedSongs.value = songsData;
        const recentData = await fetchResentlyAddedSongs();
        recentlyAddedSongs.value = recentData;
        } catch (error) {
          console.error('error fetching artists/songs/recent songs');
        }
      }


      const fetchArtistRating = async (artistId) => {
        try {
          const data = await getArtistsRatings(artistId);
          mostRatedArtists.value.find(artist => artist.id === artistId).rating = data;
        } catch (error) {
          console.log(error);
        }
      }

      const fetchRating = async (songId) => {
        try {
          const data = await getSongsRatings(songId);
          if (data) {
            mostRatedSongs.value.find(song => song.id === songId).rating = data;
          } else {
            mostRatedSongs.value.find(song => song.id === songId).rating = 0;
          }
          
        } catch (error) {
          console.error(error);
        }
      }

      const fetchRatingForRecentlyAdded = async (songId) => {
        try {
          const data = await getSongsRatings(songId);
          if (data) {
            recentlyAddedSongs.value.find(song => song.id === songId).rating = data;
          } else {
            recentlyAddedSongs.value.find(song => song.id === songId).rating = 0;
          }
          
        } catch (error) {
          console.error(error);
        }
      }

      const likeArtist = async (artistId) => {
        try {
          if (isAuthenticated.value) {
            const data = await likeDislikeArtist(artistId, user.value.id);
          isLiked.value = !isLiked.value;
          await fetchArtistRating(artistId);
          }
          
        } catch (error) {
          console.log(error);
        }
      }

      const likeSong = async (songId) => {
          try {
            if (isAuthenticated.value) {
              const data = await likeDislikeSong(songId, user.value.id);
              isLiked.value = !isLiked.value;
              await fetchRating(songId);
              await fetchRatingForRecentlyAdded(songId);
            }
            
          } catch (error) {
            console.error(error);
          }
        }

        const likeRecentSong = async (songId) => {
          try {
            if (isAuthenticated.value) {
              const data = await likeDislikeSong(songId, user.value.id);
              isLiked.value = !isLiked.value;
              await fetchRatingForRecentlyAdded(songId);
              await fetchRating(songId);
            }
            
          } catch (error) {
            console.error(error);
          }
          
        }

      getRatings();
    return {
      mostRatedArtists,
      mostRatedSongs,
      recentlyAddedSongs,
      likeSong,
      likeArtist,
      likeRecentSong
    };
    
  },
}
  </script>
  
<style>
@import '../assets/styles/mainstyle.css';
.main_container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  
}
</style>