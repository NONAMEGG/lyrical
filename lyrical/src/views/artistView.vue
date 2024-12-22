<template>
    <Header></Header>
    <div v-if="artist.length != 0">
        {{ artist[0].name }} {{ artistRating }} <span @click="likeArtist(artist.id)">like</span> <br>
        {{ artist[0].real_name }} <br>
        {{ artist[0].description }}
        <div v-if="artistSongs.length != 0">
            <router-link v-for="song in artistSongs" :key="song.id"  :to="`/lyrics/${song.id}`" active-class="active-link">
                <div>
      {{ song.title }}
    </div>
            </router-link>
        </div>
        <div v-else-if="artistSongs.length == 0">
        
    </div>
    </div>
    <div v-else>loading.....</div>
</template>

<script>
    import { ref, inject } from 'vue';
    import { useRoute } from 'vue-router';
    import { fetchArtist, fetchArtistSongs, likeDislikeSong,
        getSongsRatings, likeDislikeArtist, getArtistsRatings } from '../lib/common_methods';
    import Header from '../components/header.vue';
    export default {
        components: {
      Header
    },
        setup() {
            const isAuthenticated = inject('isAuthenticated');
      const user = inject('user');
            const route = useRoute();
            const artistId = route.params.id;
            const artist = ref([]);
            const artistSongs = ref([]);
            const artistRating = ref(0);
            const fetchArtistInfo = async () => {
                try {
                    
                    const [data] = await Promise.all([fetchArtist(artistId)]);
                    artist.value = data;
                    console.log(artist.value);
                } catch (error) {
                    console.error(`Artist info fetch error ${error}`);
                }
                
            }

            const fetchArtistRating = async () => {
        try {
          const data = await getArtistsRatings(artistId);
          artistRating.value = data;
        } catch (error) {
          console.log(error);
        }
      }

      const likeArtist = async () => {
        try {
            if (isAuthenticated.value) {
                const data = await likeDislikeArtist(artistId, user.value.id);
                await fetchArtistRating(artistId);
            }
        } catch (error) {
          console.log(error);
        }
      }

            const getArtistSongs = async () => {
                try {
                    
                    const [data] = await Promise.all([fetchArtistSongs(artistId)]);
                    artistSongs.value = data;
                    console.log(artist.value);
                } catch (error) {
                    console.error(`Artist info fetch error ${error}`);
                }
            }

            fetchArtistInfo();
            getArtistSongs();
            fetchArtistRating();
            return {
                artist,
                artistSongs,
                likeArtist,
                artistRating
            }
        }
    }

</script>