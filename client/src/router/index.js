import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import TraysView from "@/views/trays/TraysView.vue";
import TrayView from "@/views/trays/TrayView.vue";
import TasksView from "@/views/tasks/TasksView.vue";

import { useLoggedUserStore } from "@/stores/loggedUserStore.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/trays",
      name: "trays",
      beforeEnter: (to, from, next) => {
        const loggedUserStore = useLoggedUserStore();
        if (loggedUserStore.isLoggedIn) {
          next();
        } else {
          next("/login");
        }
      },
      component: TraysView,
    },
    {
      path: "/trays/:id",
      name: "tray",
      beforeEnter: (to, from, next) => {
        const loggedUserStore = useLoggedUserStore();
        if (loggedUserStore.isLoggedIn) {
          next();
        } else {
          next("/login");
        }
      },
      component: TrayView,
    },
    {
      path: "/tasks",
      name: "tasks",
      beforeEnter: (to, from, next) => {
        const loggedUserStore = useLoggedUserStore();
        if (loggedUserStore.isLoggedIn) {
          next();
        } else {
          next("/login");
        }
      },
      component: TasksView,
    },
  ],
});

export default router;
