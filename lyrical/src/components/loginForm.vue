<template>
    <div class="form_container">
      <h2>Вход</h2>
      <form @submit.prevent="login">
        <input class="auth_input" v-model="email" type="text" placeholder="Email" required />
        <br>
        <input class="auth_input" v-model="password" type="password" placeholder="Пароль" required />
        <br>
        <button type="submit" class="default_button logout_button">Войти</button>
      </form>
    </div>
  </template>
  
  <script>
  import { inject } from 'vue';
  import { authenticateUser } from '../lib/common_methods';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        username: '',
      };
    },
    setup() {
      const login = inject('login');
      return {
        login
      };
    },
    methods: {
      async login() {
        try {
          const usr = await authenticateUser(this.email, this.password);
          
          this.login({ email: usr.email, id: usr.id, username: usr.username, icon: usr.profile_icon_path, role: usr.Role });
          this.$router.push('/');
        } catch (error) {
          alert(error.message);
        }
      }
    }
  };
  </script>
  