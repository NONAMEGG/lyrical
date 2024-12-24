<template>
  <Header></Header>
  <div class="main_profile_container">
  <div>
  <img class="profile_image" :src="profileIconUrl" alt="Profile Icon"/>
</div>
  <input type="file" @change="handleFileChange" accept="image/*" class="update_image_button"/>
    <button @click="uploadPI">Загрузить картинку</button>
      <div>Имя: {{user.username}}</div>
    <div>Почта: {{user.email}}</div>
    <div>
      <button @click="showUserUpdateForm = !showUserUpdateForm" class="update_account_button">Изменить аккаунт</button>
      <div v-if="showUserUpdateForm">
        <input class="auth_input" v-model="newUsername" type="text" placeholder="Ваш логин" required />
        <br>
        <input class="auth_input" v-model="newEmail" type="email" placeholder="Email" required />
        <br>
        <input class="auth_input" v-model="newPassword" type="password" placeholder="Пароль" required />
        <br>
        <button @click="updateUserInfo">Сохранить</button>
      </div>
    </div>
    <button @click="deleteAccount">Удалить аккаунт</button>
    <router-link v-if="user.role" to="/contributor_panel">Перейти на страницу контрибьютора</router-link>
    <div v-if="artists" class="add_artist_form">
    <button @click="showForm = !showForm" class="show_form_button">Добавить песню</button>
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
    <textarea v-model="newArtist.description" placeholder="Описание артиста" class="textarea_profile"></textarea>
  </div>
  <br>
  <textarea v-model="lyricsText" class="lyrics-input textarea_profile" placeholder="Текст песни"></textarea>
  <br>
  <textarea v-model="description" class="lyrics-input textarea_profile" placeholder="Описание песни" ></textarea>
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
      <br>
      <button @click="deleteSong(song.id)">Удалить</button>
    </div>
    <div v-else>
      {{ song.title }} by {{ song.artist }} (не подтверждена)<br> <button @click="deleteSong(song.id)">Удалить</button>
    </div>
      </li>
    </ul>
  </div>
  <div v-else>Вы еще не добавляли никаких песен</div>
    </div>
    <div v-else>
    Loading...
  </div>
</div>
    <router-view />
</template>

<script>
  import Header from '../components/header.vue';
  import { ref, inject, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { uploadProfileIcon, fetchAddedSongs, deleteUsersSong, fetchArtists, addArtist, addSong,
    deleteUser, updateUser
   } from '../lib/common_methods'; 
  

  export default {
    components: {
      Header
    },
    setup() {
      const isAuthenticated = inject('isAuthenticated');
      const user = inject('user');
      const logout = inject('logout');
      const login = inject('login');
      const profileIconUrl = computed(() => user.value.icon);
      const newUsername = ref('');
      const newPassword = ref('');
      const newEmail = ref('');
      const songs = ref([]);
      const artists = ref([]);
      const router = useRouter();
      const selectedArtist = ref('');
      const showForm = ref(false);
      const showUserUpdateForm = ref(false);
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
      const handleFileChange = (event) => {
      selectedFile = event.target.files[0]
    }
    const fetchArtistsForUser = async () => {
      artists.value = [];
      try {
            const data = await fetchArtists();
            
            artists.value = data;
        } catch (error) {
          console.error('Error fetching songs:', error);  
        }
    }
    const fetchUsersSongs = async () => {
        try {
            const data = await fetchAddedSongs(user.value.id);
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
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (validImageTypes.includes(selectedFile.type)) {
        try {
        const data = await uploadProfileIcon(selectedFile, user.value.id);
        user.value.icon = data; 
        localStorage.setItem("userLogin", JSON.stringify(user.value))
      } catch (error) {
          console.error('Ошибка загрузки изображения:', error);  
        }
      } else {
        alert("Выбранный файл не является изображением.");
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
    if (selectedArtist.value === 'new') {
      const artistId = await addArtist(newArtist.value);

        newArtist.value.id = artistId; 
      artists.value.push(newArtist.value);
      selectedArtist.value = artistId;      
    }
    const songId = await addSong(songName.value, lyricsText.value.replace(/\n/g, '<br>\n').replace(/\s\s+/g, ''), description.value, selectedArtist.value, user.value.id);
    if (songId && selectedArtist.value === 'new') {
      alert("Артист и песня успешно добавлены");
      newArtist.value.name = '';
      newArtist.value.real_name = '';
      newArtist.value.description = '';
      songName.value = '';
      lyricsText.value = '';
      description.value = '';
      showForm.value = false;
    }else if (songId) {
      alert("Песня успешно добавлена");
      songName.value = '';
      lyricsText.value = '';
      description.value = '';
      showForm.value = false;
    }
    await fetchUsersSongs();
    
  } catch (error) {
    console.log('Ошибка добавления:', error);  
  }
};

const deleteAccount = async () => {
  try {
    await deleteUser(user.value.id);
    logout();
  } catch (error) {
    
  }
}

const updateUserInfo = async () => {
  try {
    await updateUser(user.value.id, newUsername.value == '' ? null : newUsername.value, newEmail.value == '' ? null : newEmail.value,
    newPassword.value == '' ? null : newPassword.value);
    if (newPassword.value != '') {
      const usr = await authenticateUser(newEmail.value == '' ? user.value.email : newEmail.value, newPassword.value);  
      login({ email: usr.email, id: usr.id, username: usr.username, icon: usr.profile_icon_path, role: usr.Role });
    }
    else {
      logout();
      router.push('/auth');
    }
    
    router.push('/');
                    

  } catch (error) {
    console.error(error);
  }
}


      fetchArtistsForUser();
      fetchUsersSongs();
      return {
        newUsername,
        newEmail,
        newPassword,
        updateUserInfo,
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
        description,
        deleteAccount,
        showUserUpdateForm,
        showForm
      };
    }
  }
</script>

<style>
  .profile_image {
    width: 100px;
    height: 100px;
  }

  .main_profile_container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .update_image_button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px;
    margin-right: 5px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .update_account_button {
    width: 540px;
  }

  .add_artist_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .show_form_button {
    width: 100px;
  }

  .textarea_profile {
    width: 500px;
  }
</style>