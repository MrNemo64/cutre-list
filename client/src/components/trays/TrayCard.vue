<script setup>
import { onMounted, ref } from "vue";

import { useTraysStore } from "@/stores/traysStore.js";
import { required } from "@/util/formRules.js";
import TrayDetails from "@/components/trays/TrayDetails.vue";

const STATES = Object.freeze({
  NONE: -1,
  LOADING: 1,
  DISPLAYING: 2,
  CONFIRMING_DELETE: 3,
  DELETING: 4,
  DELETED: 5,
  EDITTING: 6,
  SAVING_EDIT: 7,
  ERROR: 8,
});

const props = defineProps(["tray"]);
const state = ref(STATES.NONE);
const trayStore = useTraysStore();
const value = ref(undefined);
const editTrayName = ref("");
const editTrayDescription = ref("");
const form = ref("form");
const trayDetails = ref(null);

onMounted(() => {
  if (!props.tray) {
    state.value = STATES.ERROR;
    value.value = "No tray id specified";
    return;
  }

  state.value = STATES.LOADING;
  trayStore
    .getTray(props.tray)
    .then((v) => {
      value.value = v;
      state.value = STATES.DISPLAYING;
    })
    .catch((e) => {
      value.value = e;
      state.value = STATES.ERROR;
      console.error(e);
    });
});

async function onDeleteClicked() {
  state.value = STATES.DELETING;
  await trayStore.deleteTray(value.value.id);
  state.value = STATES.DELETED;
}

function startEdit() {
  editTrayName.value = value.value.name;
  editTrayDescription.value = value.value.description;
  state.value = STATES.EDITTING;
}

function finishEdit() {
  if (!form.value) return;
  state.value = STATES.SAVING_EDIT;
  trayStore
    .editTray(value.value.id, editTrayName.value, editTrayDescription.value)
    .then(() => {
      state.value = STATES.DISPLAYING;
    })
    .catch((e) => {
      console.error(e);
      value.value = e;
      state.value = STATES.ERROR;
    });
}
</script>

<template>
  <v-card
    v-if="state == STATES.NONE"
    loading
    title="Mounting"
    text="The card is still mounting"
  >
  </v-card>

  <v-card v-else-if="state == STATES.LOADING" loading title="Loading tray">
  </v-card>

  <v-card v-else-if="state == STATES.DISPLAYING">
    <v-card-item>
      <v-card-title>
        {{ value.name }}
      </v-card-title>
    </v-card-item>
    <v-card-text v-if="value.description">{{ value.description }}</v-card-text>
    <v-card-text v-else><i>No description</i></v-card-text>
    <v-card-actions>
      <v-btn color="error" @click="state = STATES.CONFIRMING_DELETE"
        >Delete</v-btn
      >
      <v-btn color="info" @click="trayDetails.showDetails()">Details</v-btn>
      <v-btn color="primary" @click="startEdit">Edit</v-btn>
    </v-card-actions>
  </v-card>

  <v-card v-else-if="state == STATES.CONFIRMING_DELETE">
    <v-card-item
      ><v-card-title>{{ value.name }}</v-card-title></v-card-item
    >
    <v-card-text v-if="value.description">{{ value.description }}</v-card-text>
    <v-card-text v-else><i>No description</i></v-card-text>
    <v-card-actions>
      <span><i>Delete?</i></span>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="state = STATES.DISPLAYING">Cancel</v-btn>
      <v-btn color="error" @click="onDeleteClicked">Confir</v-btn>
    </v-card-actions>
  </v-card>

  <v-card v-else-if="state == STATES.DELETING" loading>
    <v-card-item>
      <v-card-title>
        <i> Deleting tray #{{ value.id }}</i>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <i>We are deleting the tray {{ value.name }}</i>
    </v-card-text>
  </v-card>

  <v-card v-else-if="state == STATES.DELETED">
    <v-card-item
      ><v-card-title
        ><i>Deleted tray #{{ value.id }}</i></v-card-title
      ></v-card-item
    >
    <v-card-text
      ><i>We deleted the tray {{ value.name }}</i></v-card-text
    >
  </v-card>

  <v-form
    v-else-if="state == STATES.EDITTING"
    @submit.prevent="finishEdit"
    v-model="form"
  >
    <v-card>
      <v-card-item
        ><v-card-title
          ><v-text-field
            v-model="editTrayName"
            label="Tray name"
            :rules="[required]"
          ></v-text-field></v-card-title
      ></v-card-item>
      <v-card-text
        ><v-text-field
          v-model="editTrayDescription"
          clearable
          label="Tray description"
        ></v-text-field
      ></v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="state = STATES.DISPLAYING">Cancel</v-btn>
        <v-btn color="success" type="submit">Save</v-btn>
      </v-card-actions>
    </v-card></v-form
  >

  <v-card v-else-if="state == STATES.SAVING_EDIT" loading>
    <v-card-item></v-card-item
    ><v-card-title>Saving tray #{{ value.id }}</v-card-title>
    <v-card-text>We are saving the tray</v-card-text>
  </v-card>

  <v-card
    v-else-if="state == STATES.ERROR"
    color="error"
    title="Error with tray"
  >
    <v-card-text>{{ value }}</v-card-text>
  </v-card>

  <v-card v-else title="Invalid card state"></v-card>

  <TrayDetails :tray="props.tray" ref="trayDetails"></TrayDetails>
</template>
