import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/homeView.vue";
import AuthView from "./views/authView.vue";
import ProfileView from "./views/profileView.vue";
import SongLyricsView from "./views/songLyricsView.vue";
import ArtistView from "./views/artistView.vue";
import ContributorView from "./views/ContributorView.vue";
import { ref, inject } from "vue";
const routes = [
  { path: "/", component: HomeView },
  { path: "/auth", component: AuthView },
  { path: "/profile", component: ProfileView },
  { path: "/lyrics/:id", component: SongLyricsView },
  { path: "/artist/:id", component: ArtistView },
  { path: "/contributor_panel", component: ContributorView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = inject("isAuthenticated");
  const user = inject("user");
  if (to.path === "/profile" && !isAuthenticated.value) {
    next("/auth");
  } else if (to.path === "/contributor_panel" && !user.value.role) {
    next("/");
  } else {
    next();
  }
});

export default router;
