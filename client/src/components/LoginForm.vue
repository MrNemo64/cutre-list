<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLoggedUserStore } from "@/stores/loggedUserStore.js";
import { required } from "@/util/formRules.js";

const loggedUserStore = useLoggedUserStore();
const router = useRouter();

const userName = ref("");
const password = ref("");
const loading = ref(false);
const form = ref();
const shake = ref(false);

onMounted(async () => {});

function shakeForm() {
  shake.value = true;
  setTimeout(() => (shake.value = false), 1000);
}

async function onSubmit() {
  if (!form.value) {
    shakeForm();
    return;
  }
  loading.value = true;
  if (await loggedUserStore.login(userName.value, password.value)) {
    loading.value = false;
    router.back();
  } else {
    loading.value = false;
    shakeForm();
  }
}
</script>

<template>
  <transition name="shake" mode="out-in">
    <v-form @submit.prevent="onSubmit" v-model="form" :class="{ shake }">
      <v-text-field
        v-model="userName"
        label="User name"
        :rules="[required]"
        clearable
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        :rules="[required]"
        clearable
      ></v-text-field>
      <v-btn
        :disabled="!form"
        :loading="loading"
        block
        color="success"
        size="large"
        type="submit"
        variant="elevated"
      >
        Login
      </v-btn>
    </v-form>
  </transition>
</template>

<style scoped>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
