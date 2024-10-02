<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLoggedUserStore } from "@/stores/loggedUserStore";

const loggedUserStore = useLoggedUserStore();
const router = useRouter();

const name = ref("");
const userName = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const form = ref();
const rules = ref({
    required: (v) => !!v || "This field is required",
    email: (v) =>
        !v ||
        /^[^\s@]+@[^\s@]+$/.test(v) ||
        "E-mail must be valid",
});

onMounted(() => {
    if (loggedUserStore.isLoggedIn) router.push("/");
});

async function onSubmit() {
    if (!form.value) return;
    loading.value = true;
    const status = await loggedUserStore.register(userName.value, name.value, email.value, password.value);
    loading.value = false;
    switch(status) {
        case 200:
        case 201:
            router.push("/login");
            break;
        case 409:
            alert("Username already in use.");
            break;
        case 400:
            alert("Invalid credentials.");
            break;
    }
}
</script>

<template>
    <v-form @submit.prevent="onSubmit" v-model="form">
        <v-text-field
            v-model="name"
            label="Name"
            :rules="[rules.required]"
            clearable
        ></v-text-field>
        <v-text-field
            v-model="userName"
            label="User name"
            :rules="[rules.required]"
            clearable
        ></v-text-field>
        <v-text-field
            v-model="email"
            label="Email"
            :rules="[rules.required, /*rules.email*/]"
            clearable
        ></v-text-field>
        <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required]"
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
            Register
        </v-btn>
    </v-form>
</template>
