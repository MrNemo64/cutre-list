import { defineStore } from "pinia";

import { useLoggedUserStore } from "@/stores/loggedUserStore.js";

export const useTasksStore = defineStore({
  id: "tasks",
  state() {
    return {
      tasks: new Map(),
      user: useLoggedUserStore(),
    };
  },
  getters: {
    allTasks(state) {
      return state.tasks;
    },
  },
  actions: {
    /**
     * @param {EventTarget} eventListener
     */
    subscribe(eventListener) {
      eventListener.addEventListener("TaskCreatedEvent", (e) =>
        this._updateTaskValues(e.detail)
      );
      eventListener.addEventListener("TaskEdittedEvent", (e) =>
        this._updateTaskValues(e.detail)
      );
      eventListener.addEventListener("TasksDeletedEvent", (e) =>
        this._deleteTask(e.detail.id, e.detail.deletedSubtasks)
      );
    },

    clear() {
      this.tasks.clear();
    },

    async createNewTask(
      values = {
        title,
        description,
        priority,
        parentTaskId,
        trayId,
        startDate,
        deadLine,
      }
    ) {
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/tasks`, {
        method: "POST",
        headers,
        body: JSON.stringify(values),
      });
      if (!response.ok) return false;
      const task = await response.json();
      this._updateTaskValues(task);
      return this.tasks.get(task.id);
    },

    async editTask(
      id,
      values = {
        title,
        description,
        priority,
        state,
        trayId,
        startDate,
        deadLine,
      }
    ) {
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/tasks/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(values),
      });
      if (!response.ok) return false;
      const task = await response.json();
      this._updateTaskValues(task);
      return this.tasks.get(task.id);
    },

    async setAttachment(id, attachment) {
      const data = new FormData();
      data.append("attachment", attachment);
      const response = await fetch(
        `${this.user.baseUrl()}/tasks/${id}/attachment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.user.token}`,
          },
          body: data,
        }
      );
      if (!response.ok) return false;
      const task = await response.json();
      this._updateTaskValues(task);
      return true;
    },

    async getTask(id) {
      if (this.tasks.has(id)) return this.tasks.get(id);
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/task/${id}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) return null;
      const task = await response.json();
      this._updateTaskValues(task);
      return task;
    },

    async deleteTask(id, deleteSubtasks = true) {
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(
        `${this.user.baseUrl()}/tasks/${id}?deleteSubtasks=${deleteSubtasks}`,
        {
          method: "DELETE",
          headers,
        }
      );
      if (!response.ok) return false;
      this._deleteTask(id, deleteSubtasks);
      return true;
    },

    async findTasks(searchQuery) {
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(
        `${this.user.baseUrl()}/tasks?${searchQuery.toString()}`,
        {
          method: "GET",
          headers,
        }
      );
      if (!response.ok) return null;
      const json = await response.json();
      json.values.forEach((task) => this._updateTaskValues(task));
      return { loadedTasks: json.values, metadata: json.metadata };
    },

    attachmentUrl(id) {
      return `${this.user.baseUrl()}/tasks/${id}/attachment`;
    },

    _deleteTask(id, deleteSubtasks = false) {
      this.tasks.delete(id);
      if (deleteSubtasks) {
        this.tasks.forEach((task, tid) => {
          if (task.parentId == id) this.tasks.delete(tid);
        });
      }
    },

    _updateTaskValues(newValues) {
      const task = this.tasks.get(newValues.id);
      if (task) {
        Object.assign(task, newValues);
      } else {
        this.tasks.set(newValues.id, newValues);
      }
      return this.tasks.get(newValues.id);
    },
  },
});
