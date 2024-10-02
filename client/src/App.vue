<script setup>
import { RouterView } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <v-app>
    <NavBar></NavBar>
    <router-view></router-view>
  </v-app>
</template>

<style scoped>
  header {
    position: relative !important;
  }
</style>