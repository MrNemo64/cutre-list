<script setup>
import TraySelector from "@/components/trays/TraySelector.vue";
import { onMounted, ref, defineExpose, watch } from "vue";
import { useTasksStore } from "@/stores/tasksStore.js";
import { useTraysStore } from "@/stores/traysStore.js";
import { required } from "@/util/formRules.js";

const STATES = Object.freeze({
  NONE: -1,
  LOADING: 1,
  DISPLAYING: 2,
  EDITTING: 3,
  SAVING_EDIT: 4,
  ERROR: 5,
});

const props = defineProps(["task"]);

const value = ref(undefined);
const tray = ref();
const show = ref(false);
const taskStore = useTasksStore();
const trayStore = useTraysStore();
const state = ref(STATES.NONE);
const form = ref();

const editTitle = ref(undefined);
const editDescription = ref(undefined);
const editPriority = ref(undefined);
const editState = ref(undefined);
const editTray = ref(undefined);
let editAttachment = undefined;
const editStartDate = ref(undefined);
const editDeadLine = ref(undefined);

watch(taskStore.allTasks, async () => {
  if(value.value.trayId === undefined || value.value.trayId === null) {
    tray.value = undefined;
    return;
  }
  if (value.value.trayId !== tray.value?.id) {
    try {
      tray.value = await trayStore.getTray(value.value.trayId);
    } catch (e) {
      value.value = e;
      state.value = STATES.ERROR;
    }
  }
});

onMounted(async () => {
  state.value = STATES.LOADING;
  try {
    value.value = await taskStore.getTask(props.task);
    if (value.value.trayId)
      tray.value = await trayStore.getTray(value.value.trayId);
    state.value = STATES.DISPLAYING;
  } catch (e) {
    value.value = e;
    state.value = STATES.ERROR;
  }
});

function startEdit() {
  editTitle.value = value.value.title;
  editDescription.value = value.value.description;
  editPriority.value = value.value.priority;
  editState.value = value.value.state;
  editTray.value = value.value.trayId;
  editAttachment = value.value.attachment;
  editStartDate.value = correctDateFromServer(value.value.startDate);
  editDeadLine.value = correctDateFromServer(value.value.deadLine);

  state.value = STATES.EDITTING;
}

function correctDateForServer(date) {
  if(!date) return null;
  if(date.endsWith("Z")) return date;
  return date + ":00.000Z";
}

/**
 * 
 * @param {string} date 
 */
function correctDateFromServer(date) {
  if(!date) return undefined;
  if(date.endsWith("Z")) return date.slice(0, date.length - ":00.000Z".length);
  return date;
}

async function finishEdit() {
  if (!form.value) return;
  state.value = STATES.SAVING_EDIT;
  try {
    const edited = await taskStore.editTask(value.value.id, {
      title: editTitle.value,
      description: editDescription.value,
      priority: editPriority.value,
      state: editState.value,
      trayId: editTray.value,
      startDate: correctDateForServer(editStartDate.value),
      deadLine: correctDateForServer(editDeadLine.value),
    });
    if (edited) {
      tray.value = edited.trayId
        ? await trayStore.getTray(value.value.trayId)
        : undefined;
      if (typeof editAttachment !== "string" && editAttachment)
        await taskStore.setAttachment(value.value.id, editAttachment);
    }
    state.value = STATES.DISPLAYING;
  } catch (e) {
    value.value = e;
    state.value = STATES.ERROR;
  }
}

function showDetails() {
  show.value = true;
}

function setAttachment(event) {
  editAttachment = event.target.files[0];
}

defineExpose({ showDetails });
</script>

<template>
  <v-dialog v-model="show" max-width="600" color="info">
    <v-card
      v-if="state == STATES.NONE"
      loading
      title="Mounting"
      text="If it takes too long, reload the page"
    ></v-card>

    <v-card
      v-else-if="state == STATES.LOADING"
      loading
      title="Loading"
      text="Loading the task data"
    ></v-card>

    <v-card v-else-if="state == STATES.DISPLAYING">
      <v-card-title class="headline">{{ value.title }}</v-card-title>
      <v-card-text>
        <v-col>
          <v-row class="mb-6">
            <v-col>
              <span v-if="value.description">{{ value.description }}</span>
              <span v-else><i>No description</i></span>
            </v-col>
          </v-row>
          <v-row class="mb-6">
            <v-col>
              <v-row><strong>State</strong></v-row>
              <v-row>{{ value.state }}</v-row>
            </v-col>
            <v-col>
              <v-row><strong>Priority</strong></v-row>
              <v-row>{{ value.priority }}</v-row>
            </v-col>
          </v-row>
          <v-row class="mb-6">
            <v-col>
              <v-row><strong>Tray</strong></v-row>
              <v-row v-if="tray">
                <a
                  href="javascript:void(0)"
                  @click="$router.push(`/trays/${tray.id}`)"
                  >{{ tray.name }}</a
                >
              </v-row>
              <v-row v-else><i>No tray</i></v-row>
            </v-col>
            <v-col>
              <v-row><strong>Attachment</strong></v-row>
              <v-row v-if="value.attachment">
                <a :href="taskStore.attachmentUrl(value.id)" target="_blank">{{
                  value.attachment
                }}</a>
              </v-row>
              <v-row v-else><i>No attachment</i></v-row>
            </v-col>
          </v-row>
          <v-row class="mb-6">
            <v-col>
              <v-row><strong>Start date</strong></v-row>
              <v-row v-if="value.startDate === null">
                <i>No start date</i>
              </v-row>
              <v-row v-else>{{
                new Date(value.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}</v-row>
            </v-col>
            <v-col>
              <v-row><strong>Dead line</strong></v-row>
              <v-row v-if="value.deadLine === null">
                <i>No dead line</i>
              </v-row>
              <v-row v-else>{{
                new Date(value.deadLine).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}</v-row>
            </v-col>
            <v-col>
              <v-row><strong>Completion date</strong></v-row>
              <v-row v-if="value.completionDate === null">
                <i>No completion date</i>
              </v-row>
              <v-row v-else>{{
                new Date(value.completionDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}</v-row>
            </v-col>
          </v-row>
          <v-row class="mb-6">
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
        <v-btn color="primary" @click="show = false">Close</v-btn>
        <v-btn color="primary" @click="startEdit()">Edit</v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else-if="state == STATES.EDITTING">
      <v-form v-model="form">
        <v-card-title class="headline">
          <v-text-field
            v-model="editTitle"
            label="Title"
            clearable
            :rules="[required]"
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-col>
            <v-row class="mb-6">
              <v-col>
                <v-textarea
                  clearable
                  v-model="editDescription"
                  label="Description"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row class="mb-6">
              <v-col>
                <v-select
                  v-model="editState"
                  label="State"
                  :items="['in_progress', 'done', 'wont_do']"
                  :rules="[required]"
                ></v-select>
              </v-col>
              <v-col>
                <v-select
                  v-model="editPriority"
                  label="Priority"
                  :items="['none', 'low', 'medium', 'high']"
                  :rules="[required]"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="mb-6">
              <v-col>
                <TraySelector v-model="editTray"></TraySelector>
              </v-col>
              <v-col>
                <v-file-input
                  clearable
                  label="Attachment"
                  @change="setAttachment"
                ></v-file-input>
              </v-col>
            </v-row>
            <v-row class="mb-6">
              <v-col>
                <v-text-field
                  clearable
                  v-model="editStartDate"
                  label="Start date"
                  type="datetime-local"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  clearable
                  v-model="editDeadLine"
                  label="Dead line"
                  type="datetime-local"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="state = STATES.DISPLAYING">Cancel</v-btn>
          <v-btn color="success" @click="finishEdit()">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

    <v-card
      v-else-if="state == STATES.SAVING_EDIT"
      loading
      title="Saving"
      text="Saving the task"
    ></v-card>

    <v-card
      v-else-if="state == STATES.ERROR"
      color="error"
      title="Error"
      :text="JSON.stringify(value)"
    ></v-card>

    <v-card v-else color="error" title="Invalid state" :text="state"></v-card>
  </v-dialog>
</template>
