<template>
      <div class="menu">
        <div class="logo">
            <router-link class="link" :to="`/`">lyrical</router-link>
        </div>
</div> 
        <!-- <nav>
      <router-link to="/" exact>Главная</router-link> <br>
      <router-link to="/auth" active-class="active-link">Вход/Регистрация</router-link>
    </nav> -->
    <div class="login_signup_container">
      <LoginForm />
      <SignupForm />
    </div>
  </template>
  
  <script>
  import LoginForm from '../components/loginForm.vue';
  import SignupForm from '../components/signUpForm.vue';
  
  export default {
    components: {
      LoginForm,
      SignupForm
    }
  };
  </script>

<style>
@import '../assets/styles/mainstyle.css';
.form_container {
  width: 30%;
  text-align: center;
  border: 1px solid #000;
  margin-bottom: 10px;
  padding: 60px 0px;
  
}

h2 {
  margin: 0;
}

.login_signup_container {
  margin-top: 10px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.auth_input {
  margin-top: 10px;
  transition: .3s;
  padding: 3px;
  width: 40%;
}

button {
  padding: 3px;
  margin-top: 10px;
  width: 40%;
}

.logout_button {
  color: #000;
}

.logout_button:hover {
  background-color: rgb(68, 177, 177);
  color: #fff;
}
</style>