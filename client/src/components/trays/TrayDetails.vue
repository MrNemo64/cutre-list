<script setup>
import { onMounted, ref, defineExpose } from "vue";
import { useTraysStore } from "@/stores/traysStore.js";

const props = defineProps(["tray"]);

const value = ref(undefined);
const show = ref(false);
const trayStore = useTraysStore();

onMounted(async () => {
  value.value = await trayStore.getTray(props.tray);
});

function showDetails() {
  show.value = true;
}

defineExpose({ showDetails });
</script>

<template>
  <v-dialog v-model="show" max-width="600" color="info">
    <v-card>
      <v-card-title class="headline">{{ value.name }}</v-card-title>
      <v-card-text>
        <v-col>
          <v-row>
            <v-col>
              <span v-if="value.description">{{ value.description }}</span>
              <span v-else><i>No description</i></span>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-row><strong>Created at</strong></v-row>
              <v-row>{{
                new Date(value.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}</v-row>
            </v-col>
            <v-col>
              <v-row><strong>Updated at</strong></v-row>
              <v-row>{{
                new Date(value.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}</v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="$router.push(`/trays/${props.tray}`)">
          See tasks
        </v-btn>
        <v-btn color="primary" @click="show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
