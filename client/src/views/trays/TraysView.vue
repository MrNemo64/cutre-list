<script setup>
import TrayCard from "@/components/trays/TrayCard.vue";
import { useTraysStore } from "@/stores/traysStore.js";
import { ref } from "vue";
import { required } from "@/util/formRules.js";

const STATES = Object.freeze({
  TO_CREATE: 0,
  ASKING_FOR_VALUES: 1,
  CREATING: 2,
});

const state = ref(STATES.TO_CREATE);
const traysStore = useTraysStore();
const createTrayName = ref("");
const createTrayDescription = ref("");
const form = ref();

let trays = traysStore.allTrays;

function resetForm() {
  createTrayName.value = "";
  createTrayDescription.value = "";
}

function onCancelCreate() {
  resetForm();
  state.value = STATES.TO_CREATE;
}

async function onConfirmCreate() {
  if (!form.value) return;
  state.value = STATES.CREATING;
  if (
    await traysStore
      .createTray(createTrayName.value, createTrayDescription.value)
      .catch((e) => alert("Could not create tray: " + e))
  ) {
    resetForm();
    state.value = STATES.TO_CREATE;
  } else {
    alert("Could not create tray");
    state.value = STATES.ASKING_FOR_VALUES;
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>
          You have {{ trays?.size || 0 }}
          {{ trays?.size || 0 == 1 ? "tray" : "trays" }}.
        </h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="state == STATES.TO_CREATE">
        <v-btn color="primary" @click="state = STATES.ASKING_FOR_VALUES"
          >Create</v-btn
        >
      </v-col>
      <v-col v-else-if="state == STATES.ASKING_FOR_VALUES">
        <v-form v-model="form" @submit.prevent="onConfirmCreate">
          <v-text-field
            v-model="createTrayName"
            label="Tray name"
            :rules="[required]"
          ></v-text-field>
          <v-text-field
            v-model="createTrayDescription"
            clearable
            label="Tray description"
          ></v-text-field>
          <v-btn color="primary" @click="onCancelCreate">Cancel</v-btn>
          <v-btn color="success" type="submit">Create</v-btn>
        </v-form>
      </v-col>
      <v-col v-else-if="state == STATES.CREATING">
        <v-card loading>
          <v-card-item
            ><v-card-title>{{ createTrayName }}</v-card-title></v-card-item
          >
          <v-card-subtitle>Creating a new tray</v-card-subtitle>
          <v-card-text>{{ createTrayDescription }}</v-card-text>
          <v-card-actions> </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <transition-group name="tray-card-in-list">
        <v-col :key="tray.id" v-for="[_, tray] in trays" cols="12" md="4">
          <div class="max-width-500">
            <TrayCard :tray="tray.id"></TrayCard>
          </div>
        </v-col>
      </transition-group>
    </v-row>
  </v-container>
</template>

<style scoped>
.tray-card-in-list-leave-active {
  transition: all 1s ease;
}
.tray-card-in-list-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.max-width-500 {
  max-width: 500px;
}
</style>
