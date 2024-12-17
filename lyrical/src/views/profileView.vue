<template>
  <Header></Header>
  <div>
  <img class="profile_image" :src="profileIconUrl" alt="Profile Icon"/>
</div>
  <input type="file" @change="handleFileChange" accept="image/*" />
    <button @click="uploadPI">Загрузить картинку</button>
      <div>Имя: {{user.username}}</div>
    <div>Почта: {{user.email}}</div>
    <button @click="logout">Выйти</button>
    <div v-if="artists">
    <button @click="showForm = !showForm">Добавить песню</button>
    <div v-if="showForm">
  <input v-model="songName" type="text" placeholder="Название песни" required>
  <select v-model="selectedArtist">
    <option v-for="(artist) in artists" :key="artist.id" :value="artist.id">{{ artist.name }}</option>
    <option value="new">Добавить нового артиста</option>
  </select>

  <div v-if="selectedArtist === 'new'">
    <input v-model="newArtist.name" type="text" placeholder="Имя артиста" required>
    <input v-model="newArtist.real_name" type="text" placeholder="Настоящее имя артиста" required>
    <br>
    <textarea v-model="newArtist.description" placeholder="Описание артиста"></textarea>
  </div>
  <br>
  <textarea v-model="lyricsText" class="lyrics-input" placeholder="Текст песни"></textarea>
  <br>
  <textarea v-model="description" class="lyrics-input" placeholder="Описание песни"></textarea>
  <br>
  <button @click="addSongClick">Добавить</button>
  </div>
</div>
<div v-else>
</div>
    <div v-if="songs">
      <h3>Добавленные вами песни</h3>
      <div v-if="songs.length > 0">
      <ul>
      <li v-for="song in songs" :key="song.id">
        <div v-if="song.is_approved">
        <router-link :to="`/lyrics/${song.id}`" active-class="active-link">
        {{ song.title }} by {{ song.artist }} (подтверждена) 
      </router-link>
      <button @click="deleteSong(song.id)">Удалить</button>
    </div>
    <div v-else>
      {{ song.title }} by {{ song.artist }} (не подтверждена) <button @click="deleteSong(song.id)">Удалить</button>
    </div>
      </li>
    </ul>
  </div>
  <div v-else>Вы еще не добавляли никаких песен</div>
    </div>
    <div v-else>
    Loading...
  </div>
    <router-view />
</template>

<script>
  import Header from '../components/header.vue';
  import { ref, inject, computed } from 'vue';
  import { uploadProfileIcon, fetchAddedSongs, deleteUsersSong, fetchArtists, addArtist, addSong } from '../lib/common_methods'; 
  

  export default {
    components: {
      Header
    },
    data() {
      return {
      showForm: false,
      };
    },
    setup() {
      const isAuthenticated = inject('isAuthenticated');
      const user = inject('user');
      const logout = inject('logout');
      const profileIconUrl = computed(() => user.value.icon);
      const songs = ref([]);
      const artists = ref([]);
      const selectedArtist = ref('');
      const newArtist = ref({
      id: 0,
      name: '',
      real_name: '',
      description: ''
    });
      const songName = ref('');
      const lyricsText = ref('');
      const description = ref('');
      let selectedFile = 'default';
      console.log(user.value.icon);
      const handleFileChange = (event) => {
      selectedFile = event.target.files[0]
      console.log(selectedFile);
    }
    const fetchArtistsForUser = async () => {
      artists.value = [];
      try {
            const data = await fetchArtists();
            
            artists.value = data;
            console.log(artists);
        } catch (error) {
          console.error('Error fetching songs:', error);  
        }
    }
    const fetchUsersSongs = async () => {
        console.log('here');
        try {
            const data = await fetchAddedSongs(user.value.id);
            console.log(data);
            songs.value = data;
        } catch (error) {
          console.error('Error fetching songs:', error);  
        }
      };
      const uploadPI = async () => {
        if (!selectedFile) {
        alert('Сначала выберите изображение');
        return;
      }
        try {
        const data = await uploadProfileIcon(selectedFile, user.value.id);
        user.value.icon = data; 
        console.log(user.value.icon);
        localStorage.setItem("userLogin", JSON.stringify(user.value))
      } catch (error) {
          console.error('Ошибка загрузки изображения:', error);  
        }
      }

      const deleteSong = async (songId) => {
        try {
        await deleteUsersSong(songId);
        const index = songs.value.findIndex(item => item.id === songId);
        if (index !== -1) {
        songs.value.splice(index, 1); 
      }
      } catch (error) {
          console.error('Ошибка загрузки изображения:', error);  
        }
      }

      const addSongClick = async () => {
  try {
    console.log(selectedArtist.value);
    if (selectedArtist.value === 'new') {
      const artistId = await addArtist(newArtist.value);
      newArtist.value.id = artistId; 
      artists.value.push(newArtist.value);
      selectedArtist.value = artistId;
    }
    console.log(lyricsText.value);
    const songId = await addSong(songName.value, lyricsText.value.replace(/\n/g, '<br>\n').replace(/\s\s+/g, ''), description.value, selectedArtist.value, user.value.id);
    await fetchUsersSongs();
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);  
  }
};


      fetchArtistsForUser();
      fetchUsersSongs();
      return {
        isAuthenticated,
        user,
        logout,
        selectedArtist,
        uploadPI,
        handleFileChange,
        profileIconUrl,
        selectedFile,
        songs,
        deleteSong,
        addSongClick,
        artists,
        newArtist,
        songName,
        lyricsText,
        description
      };
    }
  }
</script>

<style>
  .profile_image {
    width: 100px;
    height: 100px;
  }

</style>