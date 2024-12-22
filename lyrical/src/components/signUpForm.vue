<template>
    <div class="form_container">
      <h2>Зарегистрироваться</h2>
      <form @submit.prevent="signUp">
        <input class="auth_input" v-model="username" type="text" placeholder="Ваш логин" required />
        <br>
        <input class="auth_input" v-model="email" type="email" placeholder="Email" required />
        <br>
        <input class="auth_input" v-model="password" type="password" placeholder="Пароль" required />
        <br>
        <button type="submit" class="default_button logout_button">Зарегистрироваться</button>
      </form>
    </div>
  </template>


<script>
  import { inject } from 'vue';
  import { signup, authenticateUser } from '../lib/common_methods';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        username: ''
      };
    },
    setup() {
      const login = inject('login');
      return {
        login
      };
    },
    methods: {
      async signUp() {
        try {
          await signup(this.email, this.password, this.username);

          const usr = await authenticateUser(this.email, this.password);
          
          this.login({ email: usr.email, id: usr.id, username: this.username, icon: usr.profile_icon_path, role: usr.Role });
          this.$router.push('/');
        } catch (error) {
          alert(error.message);
        }
      }
    }
  };
  </script>
