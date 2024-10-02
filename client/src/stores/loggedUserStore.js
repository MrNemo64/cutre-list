import { defineStore } from "pinia";
import { API_URL } from "@/util/config.js";
import { useTraysStore } from "@/stores/traysStore.js";
import { useTasksStore } from "@/stores/tasksStore.js";

function getStores() {
  return [useTraysStore(), useTasksStore()];
}

export const useLoggedUserStore = defineStore({
  id: "loggedUser",
  state() {
    return {
      token: localStorage.getItem("logged-user.token") || undefined,
      expiration: localStorage.getItem("logged-user.expiration") || undefined,
      tokenRefreshTask: undefined,
      loggedUser: undefined,
      eventListener: undefined,
      eventTarget: new EventTarget(),
    };
  },
  getters: {
    isLoggedIn(state) {
      return !!state.loggedUser;
    },
    isListeningForEvents(state) {
      return state.eventListener?.readyState == EventSource.OPEN;
    },
  },
  actions: {
    async init() {
      if (await this.reloadUserInformation()) this.createRefreshTask();
      getStores().forEach((store) => store.subscribe(this.eventTarget));
      this.eventTarget.addEventListener("TokenInvalidatedEvent", () => {
        alert("Session invalidated by admin, loggin again");
        this.logout();
      });
      this.eventTarget.addEventListener("UserEdittedEvent", (e) => {
        this.loggedUser = e.detail;
      });
      this.eventTarget.addEventListener("UserDeletedEvent", () => {
        alert("Your user was deleted");
        this.logout();
      });
    },

    logout() {
      this.token = undefined;
      this.expiration = undefined;
      clearTimeout(this.tokenRefreshTask);
      this.tokenRefreshTask = undefined;
      this.loggedUser = undefined;
      this.eventListener?.close();
      this.eventListener = undefined;
      localStorage.removeItem("logged-user.token");
      localStorage.removeItem("logged-user.expiration");

      getStores().forEach((store) => store.clear());
    },

    /**
     * Logs in the user with the provided credentials.
     * @param {string} username - The username.
     * @param {string} password - The password.
     * @returns {Promise<boolean>} A promise that resolves to true if login is successful, false otherwise.
     */
    async login(username, password) {
      this.logout();
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) return false;
      const { token, expiration, user } = await response.json();
      this.token = token;
      this.expiration = expiration;
      localStorage.setItem("logged-user.token", token);
      localStorage.setItem("logged-user.expiration", expiration);
      this.loggedUser = user;
      this.createRefreshTask();
      this._connect();
      return true;
    },

    async _connect() {
      if (!this.token) return false;
      const headers = await this.requestHeaders();
      if (!headers) return false;
      const requestTokenResponse = await fetch(`${API_URL}/my-events`, {
        method: "POST",
        headers,
      });
      if (!requestTokenResponse.ok) return false;
      const token = await requestTokenResponse.text();

      const eventSource = new EventSource(`${API_URL}/my-events/${token}`);
      eventSource.onerror = console.error;
      eventSource.onmessage = (e) => {
        const { name, data } = JSON.parse(e.data);
        this.eventTarget.dispatchEvent(new CustomEvent(name, { detail: data }));
      };
      this.eventListener = eventSource;
    },

    async register(username, name, email, password, admin = false) {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
          admin,
        }),
      });
      return response.status;
    },

    async reloadUserInformation() {
      if (!this.token) {
        this.logout();
        return false;
      }
      const response = await fetch(`${API_URL}/users/self`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      if (!response.ok) {
        this.logout();
        return false;
      }
      this.loggedUser = await response.json();
      if (!this.isListeningForEvents) this._connect();
      return true;
    },

    createRefreshTask() {
      if (!this.expiration) return;
      if (this.tokenRefreshTask) clearTimeout(this.tokenRefreshTask);
      const timeToRefresh = this.expiration - Date.now();
      this.tokenRefreshTask = setTimeout(() => {
        this.logout();
      }, Math.max(0, timeToRefresh));
    },

    async requestHeaders() {
      if (!this.loggedUser)
        if (!(await this.reloadUserInformation())) return null;
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      };
    },

    baseUrl() {
      return `${API_URL}/users/${this.loggedUser.id}`;
    },
  },
});
