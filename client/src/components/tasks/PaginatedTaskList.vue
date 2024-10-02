<script setup>
import TraySelector from "@/components/trays/TraySelector.vue";
import TaskCard from "@/components/tasks/TaskCard.vue";
import { useTasksStore } from "@/stores/tasksStore.js";
import { onMounted, ref, watch } from "vue";
import { required, geq, isInteger } from "@/util/formRules.js";

const props = defineProps(["fixedtray"]);
const taskStore = useTasksStore();
const loadingTasks = ref(false);

const filterByTitle = ref(undefined);
const filterByDescription = ref(undefined);
const filterByPriority = ref(undefined);
const filterByState = ref(undefined);
const filterByStartDate = ref(undefined);
const filterByDeadLine = ref(undefined);
const filterByCompletionDate = ref(undefined);
const filterByTray = ref();
const amountOfTasks = ref(3);
const form = ref();

const disaleFilterByCompletionDate = ref(null);
const filterOpen = ref(undefined);

const tasks = ref([]);

let activeQuery = new URLSearchParams({
  page: 0,
  limit: 3,
});

watch(filterByState, () => {
  if (filterByState.value == "done") {
    disaleFilterByCompletionDate.value = false;
  } else if (
    filterByState.value == "wont_do" ||
    filterByState.value == "in_progress"
  ) {
    disaleFilterByCompletionDate.value = true;
    filterByCompletionDate.value = undefined;
  } else {
    disaleFilterByCompletionDate.value = false;
  }
});
watch(filterByCompletionDate, () => {
  if (filterByCompletionDate.value) {
    filterByState.value = "done";
  }
});
const actualPage = ref(1);
const totalPages = ref(1);
const totalTasks = ref(1);
watch(actualPage, () => {
  activeQuery.set("page", actualPage.value - 1);
  updateTasks();
});
watch(taskStore.allTasks, () => updateTasks());

onMounted(() => {
  if (props.fixedtray) {
    filterByTray.value = props.fixedtray;
    activeQuery.set("tray", props.fixedtray);
  }
  applyFilters();
  updateTasks();
});

async function updateTasks() {
  loadingTasks.value = true;
  const { loadedTasks, metadata } = await taskStore.findTasks(activeQuery);

  totalTasks.value = metadata.total;
  totalPages.value = Math.ceil(metadata.total / activeQuery.get("limit"));
  loadingTasks.value = false;
  tasks.value = loadedTasks;
}

function clearFilters() {
  filterByTitle.value = undefined;
  filterByDescription.value = undefined;
  filterByPriority.value = undefined;
  filterByState.value = undefined;
  filterByStartDate.value = undefined;
  filterByDeadLine.value = undefined;
  filterByCompletionDate.value = undefined;
  filterByTray.value = [];
  amountOfTasks.value = 3;

  actualPage.value = 1;
}

function applyFilters() {
  if (!form.value) return;
  filterOpen.value = undefined;
  activeQuery = new URLSearchParams();
  activeQuery.set("limit", amountOfTasks.value);

  if (filterByTitle.value) activeQuery.set("title", filterByTitle.value);
  if (filterByDescription.value)
    activeQuery.set("description", filterByDescription.value);
  if (filterByPriority.value)
    activeQuery.set("priority", filterByPriority.value);
  if (filterByState.value) activeQuery.set("state", filterByState.value);
  if (filterByStartDate.value)
    activeQuery.set("startDate", filterByStartDate.value);
  if (filterByDeadLine.value)
    activeQuery.set("seadLine", filterByDeadLine.value);
  if (filterByCompletionDate.value)
    activeQuery.set("completionDate", filterByCompletionDate.value);
  if (props.fixedtray !== undefined) {
    activeQuery.set("tray", props.fixedtray);
  } else if (filterByTray.value && filterByTray.value.length > 0)
    filterByTray.value.forEach((v) => activeQuery.append("tray", v));

  if (actualPage.value === 1) {
    updateTasks();
  } else {
    actualPage.value = 1;
  }
}

defineExpose({ updateTasks });
</script>
<template>
  <v-container>
    <v-row>
      <v-col>
        <v-expansion-panels v-model="filterOpen">
          <v-expansion-panel>
            <v-expansion-panel-title>Filters</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col>
                  <v-form v-model="form" @submit.prevent="applyFilters">
                    <v-row>
                      <v-col>
                        <v-row>
                          <v-col>
                            <v-text-field
                              clearable
                              v-model="filterByTitle"
                              label="Title"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-select
                              clearable
                              v-model="filterByPriority"
                              label="Priority"
                              :items="['none', 'low', 'medium', 'high']"
                            ></v-select>
                          </v-col>
                          <v-col>
                            <v-select
                              clearable
                              v-model="filterByState"
                              label="State"
                              :items="['in_progress', 'done', 'wont_do']"
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col>
                        <v-textarea
                          clearable
                          v-model="filterByDescription"
                          label="Description"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-text-field
                          clearable
                          v-model="filterByStartDate"
                          label="Start date"
                          type="date"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          clearable
                          v-model="filterByDeadLine"
                          label="Dead line"
                          type="date"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          :disabled="disaleFilterByCompletionDate"
                          clearable
                          v-model="filterByCompletionDate"
                          label="Completion date"
                          type="date"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <TraySelector
                          :disabled="props.fixedtray !== undefined"
                          :multiple="props.fixedtray === undefined"
                          v-model="filterByTray"
                        ></TraySelector>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="amountOfTasks"
                          label="Tasks per page"
                          type="number"
                          :rules="[required, geq(1), isInteger]"
                          min="1"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-btn color="primary" @click="clearFilters"
                          >Clear</v-btn
                        >
                        <v-btn
                          color="success"
                          type="submit"
                          :disabled="loadingTasks"
                          >Filter</v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-form>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card variant="tonal" title="Tasks" :loading="loadingTasks">
          <v-card-item>
            <v-card-subtitle v-if="totalTasks > 0">{{
              `Page ${actualPage} of ${totalPages}. There ${
                totalTasks == 1 ? "is" : "are"
              } ${totalTasks} ${totalTasks == 1 ? "task" : "tasks"}.`
            }}</v-card-subtitle>
            <v-card-subtitle v-else>No tasks</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-row>
              <v-col :key="task.id" v-for="task in tasks" cols="12" md="4">
                <div class="max-width-500">
                  <TaskCard :task="task.id"></TaskCard>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row>
              <v-col>
                <v-pagination
                  v-model="actualPage"
                  :length="totalPages"
                  :disabled="loadingTasks"
                ></v-pagination>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.max-width-500 {
  max-width: 500px;
}
</style>
