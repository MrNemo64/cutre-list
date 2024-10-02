<script setup>
import { useTheme } from "vuetify/lib/framework.mjs";
import { useLoggedUserStore } from "@/stores/loggedUserStore";
import { useRouter } from "vue-router";
import { computed } from "vue";

const loggedUserStore = useLoggedUserStore();
const theme = useTheme();
const router = useRouter();

if (localStorage.getItem("app.theme")) {
  theme.global.name.value = localStorage.getItem("app.theme");
}

function toggleTheme() {
  const newTheme = theme.global.current.value.dark ? "light" : "dark";
  theme.global.name.value = newTheme;
  localStorage.setItem("app.theme", newTheme);
}

function logout() {
  loggedUserStore.logout();
  router.push("/login");
}

const user = computed(() => loggedUserStore.loggedUser);
</script>

<template>
  <v-app-bar color="primary">
    <v-app-bar-title @click="$router.push('/')" style="cursor: pointer"
      >CutreList
    </v-app-bar-title>
    <template v-if="loggedUserStore.isLoggedIn">
      <v-btn varian="text" :to="'/trays'">Trays</v-btn>
      <v-btn varian="text" :to="'/tasks'">Tasks</v-btn>
      <v-spacer></v-spacer>
      <v-menu transition="scale-transition">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props">{{
            user.username
          }}</v-btn>
        </template>
        <v-list>
          <v-list-item><v-btn @click="toggleTheme">Theme</v-btn></v-list-item>
          <v-list-item>
            <v-btn @click="logout" variant="text">Logout</v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template v-else>
      <v-btn @click="toggleTheme">Theme</v-btn>
      <v-btn varian="text" :to="'/login'">Login</v-btn>
      <v-btn variant="text" :to="'/register'">Register</v-btn>
    </template>
  </v-app-bar>
</template>
