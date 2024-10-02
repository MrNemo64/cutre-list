<script setup>
import { onMounted, ref } from "vue";
import { useTasksStore } from "@/stores/tasksStore.js";
import TrayDetails from "@/components/trays/TrayDetails.vue";
import TaskDetails from "@/components/tasks/TaskDetails.vue";

const STATES = Object.freeze({
  NONE: -1,
  LOADING: 1,
  DISPLAYING: 2,
  CONFIRMING_DELETE: 3,
  DELETING: 4,
  DELETED: 5,
  ERROR: 6,
});

const props = defineProps(["task"]);
const state = ref(STATES.NONE);
const taskStore = useTasksStore();
const value = ref(undefined);
const trayDetails = ref();
const taskDetails = ref();

onMounted(() => {
  if (!props.task) {
    state.value = STATES.ERROR;
    value.value = "No task id specified";
    return;
  }

  state.value = STATES.LOADING;
  taskStore
    .getTask(props.task)
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
  await taskStore.deleteTask(value.value.id);
  state.value = STATES.DELETED;
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

  <v-card v-else-if="state == STATES.LOADING" loading title="Loading task">
  </v-card>

  <v-card v-else-if="state == STATES.DISPLAYING">
    <v-card-item>
      <v-card-title>{{ value.title }}</v-card-title>
      <v-card-subtitle>
        State: {{ value.state }} | Priority:
        {{ value.priority }}
      </v-card-subtitle>
    </v-card-item>
    <v-card-text v-if="value.description">{{ value.description }}</v-card-text>
    <v-card-text v-else><i>No description</i></v-card-text>
    <v-card-actions>
      <v-btn color="error" @click="state = STATES.CONFIRMING_DELETE">
        Delete
      </v-btn>
      <v-btn color="info" @click="taskDetails.showDetails()">Details</v-btn>
      <v-btn
        color="info"
        v-if="value?.trayId"
        @click="trayDetails.showDetails()"
        >Tray</v-btn
      >
    </v-card-actions>
  </v-card>

  <v-card v-else-if="state == STATES.CONFIRMING_DELETE">
    <v-card-item>
      <v-card-title>{{ value.title }}</v-card-title>
      <v-card-subtitle>
        State: {{ value.state }} | Priority:
        {{ value.priority }}
      </v-card-subtitle>
    </v-card-item>
    <v-card-text v-if="value.description">{{ value.description }}</v-card-text>
    <v-card-text v-else><i>No description</i></v-card-text>
    <v-card-actions>
      <span><i>Delete? All subtasks will be deleted</i></span>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="state = STATES.DISPLAYING">Cancel</v-btn>
      <v-btn color="error" @click="onDeleteClicked">Confir</v-btn>
    </v-card-actions>
  </v-card>

  <v-card v-else-if="state == STATES.DELETING">
    <v-card-item>
      <v-card-title>Deleting task #{{ value.id }}</v-card-title>
      <v-card-subtitle>
        <i>We are deleting the task {{ value.title }}</i>
      </v-card-subtitle>
    </v-card-item>
  </v-card>

  <v-card v-else-if="state == STATES.DELETED">
    <v-card-item>
      <v-card-title>
        <i>Deleted task #{{ value.id }}</i>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <i>We deleted the task {{ value.title }}</i>
    </v-card-text>
  </v-card>

  <v-card
    v-else-if="state == STATES.ERROR"
    color="error"
    title="Error with task"
  >
    <v-card-text>{{ value }}</v-card-text>
  </v-card>

  <v-card v-else title="Invalid card state"></v-card>

  <TaskDetails
    v-if="value?.id"
    :task="value.id"
    ref="taskDetails"
  ></TaskDetails>

  <TrayDetails
    v-if="value && value.trayId !== null"
    :tray="value.trayId"
    ref="trayDetails"
  ></TrayDetails>
</template>
