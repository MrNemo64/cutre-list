<script setup>
import PaginatedTaskList from "@/components/tasks/PaginatedTaskList.vue";
import TraySelector from "@/components/trays/TraySelector.vue";
import { useTasksStore } from "@/stores/tasksStore.js";
import { required } from "@/util/formRules.js";
import { onMounted } from "vue";
import { ref } from "vue";

const STATES = Object.freeze({
  TO_CREATE: 0,
  ASKING_FOR_VALUES: 1,
  CREATING: 2,
});

const taskStore = useTasksStore();
const state = ref(STATES.TO_CREATE);

const createTitle = ref();
const createDescription = ref();
const createPriority = ref();
const createTray = ref();
let createAttachment = undefined;
const showCreateStartDate = ref(false);
const createStartDate = ref();
const showCreateDeadline = ref(false);
const createDeadline = ref();
const form = ref();

function resetForm() {
  createTitle.value = "";
  createDescription.value = "";
  createPriority.value = undefined;
  createTray.value = undefined;
  createAttachment = undefined;
  showCreateStartDate.value = false;
  createStartDate.value = undefined;
  showCreateDeadline.value = false;
  createDeadline.value = undefined;
}

function onCancelCreate() {
  resetForm();
  state.value = STATES.TO_CREATE;
}

async function createTask() {
  if (!form.value) return;
  state.value = STATES.CREATING;
  const createdTask = await taskStore
    .createNewTask({
      title: createTitle.value,
      description: createDescription.value,
      priority: createPriority.value,
      trayId: createTray.value,
      startDate: createStartDate.value,
      deadLine: createDeadline.value,
    })
    .catch((e) => alert("Could not create task: " + e));
  if (createdTask) {
    if (createAttachment) {
      await taskStore.setAttachment(createdTask.id, createAttachment);
    }
    resetForm();
    state.value = STATES.TO_CREATE;
  } else {
    alert("Could not create task");
    state.value = STATES.ASKING_FOR_VALUES;
  }
}

function setAttachment(event) {
  createAttachment = event.target.files[0];
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col v-if="state == STATES.TO_CREATE">
        <v-btn color="primary" @click="state = STATES.ASKING_FOR_VALUES">
          Create
        </v-btn>
      </v-col>
      <v-col v-else-if="state == STATES.ASKING_FOR_VALUES"
        ><v-form id="form" v-model="form" @submit.prevent="createTask">
          <v-text-field
            v-model="createTitle"
            label="Title"
            clearable
            :rules="[required]"
          ></v-text-field>
          <v-textarea
            clearable
            v-model="createDescription"
            label="Description"
          ></v-textarea>
          <v-select
            clearable
            v-model="createPriority"
            label="Priority"
            :items="['none', 'low', 'medium', 'high']"
          ></v-select>
          <TraySelector v-model="createTray"></TraySelector>
          <v-row>
            <v-col>
              <v-file-input
                clearable
                label="Attachment"
                @change="setAttachment"
              ></v-file-input>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              ><v-checkbox
                label="Deadline"
                v-model="showCreateDeadline"
              ></v-checkbox>
              <v-date-picker
                v-if="showCreateDeadline"
                show-adjacent-months
                v-model="createDeadline"
                color="primary"
              ></v-date-picker
            ></v-col>
            <v-col
              ><v-checkbox
                label="Start date"
                v-model="showCreateStartDate"
              ></v-checkbox>
              <v-date-picker
                v-if="showCreateStartDate"
                show-adjacent-months
                v-model="createStartDate"
                color="primary"
              ></v-date-picker
            ></v-col>
          </v-row>
          <v-btn color="primary" @click="onCancelCreate">Cancel</v-btn>
          <v-btn color="success" type="submit">Create</v-btn>
        </v-form>
      </v-col>
      <v-col v-else-if="state == STATES.CREATING">
        <v-card loading>
          <v-card-item>
            <v-card-title>{{ createTitle }}</v-card-title>
            <v-card-subtitle>Creating a new task</v-card-subtitle>
          </v-card-item>
          <v-card-text>{{ createDescription }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <PaginatedTaskList></PaginatedTaskList>
    </v-row>
  </v-container>
</template>
