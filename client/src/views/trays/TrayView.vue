<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTraysStore } from "@/stores/traysStore.js";
import PaginatedTaskList from "@/components/tasks/PaginatedTaskList.vue";

const STATES = Object.freeze({
  NONE: -1,
  LOADING: 1,
  LOADED: 2,
  ERROR: 3,
});

const route = useRoute();
const trayStore = useTraysStore();

const state = ref(STATES.NONE);
const trayId = route.params.id;
const value = ref();
const paginated = ref();

onMounted(() => {
  state.value = STATES.LOADING;
  trayStore
    .getTray(trayId)
    .then((tray) => {
      value.value = tray;
      state.value = STATES.LOADED;
    })
    .catch((e) => {
      value.value = e;
      state.value = STATES.ERROR;
    });
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card
          v-if="state == STATES.LOADING"
          :title="'Loading tray #' + trayId"
        >
        </v-card>

        <v-card
          v-else-if="state == STATES.LOADED"
          :title="value.name"
          :subtitle="'#' + value.id"
        >
          <v-card-text>
            <PaginatedTaskList :fixedtray="trayId"></PaginatedTaskList>
          </v-card-text>
        </v-card>

        <v-card
          v-else-if="state == STATES.ERROR"
          color="error"
          title="Error loading tray"
          :text="value"
        >
        </v-card>

        <v-card
          v-else-if="state == STATES.NONE"
          color="warning"
          title="Waiting to mount"
          text="If this takes too long, reload the page"
        >
        </v-card>

        <v-card
          v-else
          title="Invalid state"
          text="This should not be possible"
          color="error"
        ></v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
