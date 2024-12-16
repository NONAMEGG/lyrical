import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/homeView.vue";
import AuthView from "./views/authView.vue";
import ProfileView from "./views/profileView.vue";
import SongLyricsView from "./views/songLyricsView.vue";
import ArtistView from "./views/artistView.vue";
import { ref, inject } from "vue";
const routes = [
  { path: "/", component: HomeView },
  { path: "/auth", component: AuthView },
  { path: "/profile", component: ProfileView },
  { path: "/lyrics/:id", component: SongLyricsView },
  { path: "/artist/:id", component: ArtistView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = inject("isAuthenticated");
  if (to.path === "/profile" && !isAuthenticated.value) {
    next("/auth");
  } else {
    next();
  }
});

export default router;
