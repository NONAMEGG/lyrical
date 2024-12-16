<template>
    <div class="menu">
        <div class="logo">
            <router-link class="link" :to="`/`">lyrical</router-link>
        </div>
        <div class="search_container">
            <div class="search_bar">
    <input v-model="searchQuery" class="search_input"  @blur="handleBlur" @focus="handleFocus" @input="search" placeholder="Найти песню"/>
</div>
  <ul class="search_results" v-if="showResults && searchQuery != ''">
    <li v-for="song in songs" :key="song.id" class="search_result_element">
      <router-link class="link search_song_link" :to="`/lyrics/${song.id}`" active-class="active-link">
      {{ song.title }} <br>
      <span class="artist">artist: {{ song.artist }}</span>
    </router-link>
    </li>
  </ul>
  <ul v-else-if="showResults" class="search_results" style="color: #000;">
    Песен не найдено
  </ul>
</div>
<nav>
    <router-link v-if="!isAuthenticated" to="/auth" class="link">Вход/Регистрация</router-link>
    <div v-else>
      <router-link to="/profile" class="link">Профиль {{ user.username }}</router-link>
      <div class="logout_button_container">
      <button @click="logout" class="default_button logout_button">Выйти</button>
    </div>
    </div>
  </nav>
  <router-view />
</div>
</template>

<script>
  import { ref, inject } from 'vue';
  import { searchSongs } from '../lib/common_methods';
  
  export default {
    watch: {
    $route(to, from) {
      if (to.path !== from.path) {
        this.refreshPage();
      }
    }
  },
    setup() {
      const isAuthenticated = inject('isAuthenticated');
      const user = inject('user');
      const logout = inject('logout');
      const searchQuery = ref('');
      const songs = ref([]);
      const showResults = ref(false);
  
      const search = async () => {
        console.log(showResults);
        console.log(searchQuery.value);
        songs.value = [];
        try {
            const data = await searchSongs(searchQuery.value);
            console.log(data);
            songs.value = data;
        } catch (error) {
          console.error('Error fetching songs:', error);  
        }
      };

      const handleFocus = () => {
            showResults.value = true;
      }

      const handleBlur = () => {
        setTimeout(() => {
      showResults.value = false;
    }, 200);
      }

      const refreshPage = () => {
        location.reload();
      }
  
      return {
        isAuthenticated,
        user,
        logout,
        searchQuery,
        songs,
        search,
        handleFocus,
        showResults,
        handleBlur,
        refreshPage
      };
    }
  };
</script>

