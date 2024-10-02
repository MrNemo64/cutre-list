<script setup>
import { useTraysStore } from "@/stores/traysStore.js";
import { computed } from "vue";

const trayStore = useTraysStore();

const props = defineProps(["disabled", "multiple"]);

const disableTrays = computed(() => {
  return allTrays.value.length == 0;
});
const allTrays = computed(() =>
  Array.from(trayStore.allTrays.values()).map((tray) => ({
    name: tray.name,
    id: tray.id,
    description: truncateString(tray.description, 50),
  }))
);
const selectedTray = defineModel();

function truncateString(inputString, maxLength) {
  if (!inputString) return "";
  if (inputString.length <= maxLength) {
    return inputString;
  } else {
    return inputString.slice(0, maxLength) + "...";
  }
}
</script>
<template>
  <v-autocomplete
    clearable
    :multiple="props.multiple || false"
    :chips="props.multiple || false"
    :closable-chips="props.multiple || false"
    :disabled="props.disabled || disableTrays"
    v-model="selectedTray"
    label="Tray"
    item-title="name"
    item-value="id"
    :items="allTrays"
  >
    <template v-slot:chip="{ p, item }">
      <v-chip v-if="props.multiple || false" :text="item.raw.name"></v-chip>
      <span v-else>{{ item.raw.name }}</span>
    </template>

    <template v-slot:item="{ props, item }">
      <v-list-item v-bind="props" :title="item.raw?.name">
        <v-list-item-subtitle v-if="item.raw?.description">
          {{ item.raw.description }}
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else>
          <i>No description</i>
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>
