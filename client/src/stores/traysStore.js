import { defineStore } from "pinia";

import { useLoggedUserStore } from "@/stores/loggedUserStore.js";

export const useTraysStore = defineStore({
  id: "trays",
  state() {
    return {
      trays: new Map(),
      user: useLoggedUserStore(),
    };
  },
  getters: {
    allTrays(state) {
      return state.trays;
    },
  },
  actions: {
    /**
     * @param {EventTarget} eventListener 
     */
    subscribe(eventListener) {
      eventListener.addEventListener("TrayCreatedEvent", (e) => this._updateTrayValues(e.detail));
      eventListener.addEventListener("TrayEdittedEvent", (e) => this._updateTrayValues(e.detail));
      eventListener.addEventListener("TrayDeletedEvent", (e) => this.trays.delete(e.detail));
    },

    clear() {
      this.trays.clear();
    },

    async loadAllTrays() {
      const headers = await await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/trays`, {
        method: "GET",
        headers,
      });
      if (!response.ok) throw new Error(response.status);
      const trays = await response.json();
      const ids = trays.map((tray) => tray.id);
      trays.forEach((tray) => this._updateTrayValues(tray));
      this.trays.forEach((_, key) => {
        if (!ids.includes(key)) this.trays.delete(key);
      });
      return this.trays;
    },

    async getTray(id) {
      if (this.trays.has(id)) return this.trays.get(id);
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/trays/${id}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) throw new Error(response.status);
      const tray = await response.json();
      return this._updateTrayValues(tray);
    },

    getAllLoadedTrayIds() {
      return this.trays.keys();
    },

    async createTray(name, description = "") {
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/trays`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) return false;
      this._updateTrayValues(await response.json());
      return true;
    },

    async editTray(id, name, description) {
      if (!name && !description) return;
      const payload = {};
      if (name) payload.name = name;
      if (description) payload.description = description;
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/trays/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) return false;
      this._updateTrayValues(await response.json());
      return true;
    },

    async deleteTray(id) {
      const headers = await this.user.requestHeaders();
      if (!headers) return false;
      const response = await fetch(`${this.user.baseUrl()}/trays/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) return false;
      this.trays.delete(id);
      return true;
    },

    _updateTrayValues(newValues) {
      const tray = this.trays.get(newValues.id);
      if (tray) {
        Object.assign(tray, newValues);
      } else {
        this.trays.set(newValues.id, newValues);
      }
      return this.trays.get(newValues.id);
    },
  },
});
