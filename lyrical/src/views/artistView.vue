<template>
    <Header></Header>
    <div v-if="artist.length != 0" class="main_artist_container">
        <h1>{{ artist[0].name }} <span class="top_rating">{{ artistRating ? artistRating : 0 }}</span> <img src="/heart-regular.svg" @click="likeArtist(artist.id)" alt="Поставить лайк" class="like_song_icon"> <br></h1>
        Настоящее имя: {{ artist[0].real_name }} <br>
        Об артисте: {{ artist[0].description }}
          
       
        <div v-if="user.role">
            <button @click="showForm = !showForm">Обновить данные об артисте</button>
            <div v-if="showForm">
                <input class="auth_input" v-model="newName" type="text" placeholder="Имя артиста" />
        <br>
        <input class="auth_input" v-model="newRealName" type="text" placeholder="Настоящее имя артиста" required />
        <br>
        <input class="auth_input" v-model="newDescription" type="text" placeholder="Описание" required />
        <br>
        <button @click="updateArtistInfo">Сохранить</button>
            </div>
            <button @click="deleteArtistClick">Удалить артиста</button>
        </div>
        <h2>Песни артиста</h2>
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
    <div v-else>Такого артиста нет</div>
    <router-view />
</template>

<script>
    import { ref, inject } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { fetchArtist, fetchArtistSongs, likeDislikeSong,
        getSongsRatings, likeDislikeArtist, getArtistsRatings, updateArtist, deleteArtist } from '../lib/common_methods';
    import Header from '../components/header.vue';
    export default {
        components: {
      Header
    },
        setup() {
            const isAuthenticated = inject('isAuthenticated');
      const user = inject('user');
            const route = useRoute();
            const router = useRouter();
            const artistId = route.params.id;
            const artist = ref([]);
            const artistSongs = ref([]);
            const artistRating = ref(0);
            const newName = ref('');
            const newDescription = ref('');
            const newRealName = ref('');
            const showForm = ref(false);
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

      const deleteArtistClick = async () => {
        
        await deleteArtist(artistId);
        router.push('/');
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

            const updateArtistInfo = async () => {
                try {
                    await updateArtist(artistId, newName.value == '' ? null : newName.value, newRealName.value == '' ? null : newRealName.value,
                        newDescription.value == '' ? null : newDescription.value
                     );
                     window.location.reload();
                } catch (error) {
                    console.error(error);
                }
            }

            fetchArtistInfo();
            getArtistSongs();
            fetchArtistRating();
            return {
                user,
                showForm,
                newName,
                newDescription,
                newRealName,
                updateArtistInfo,
                artist,
                artistSongs,
                likeArtist,
                artistRating,
                deleteArtistClick
            }
        }
    }

</script>


<style>
.main_artist_container {
    padding-left: 40px;
    margin-top: 20px;
    width: 80%;
}
</style>