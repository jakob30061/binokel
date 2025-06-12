import { defineStore } from 'pinia';
import { ref } from 'vue';

interface User {
  uuid: string;
  [k: string]: unknown;
}

export const useStore = defineStore('global', () => {
  // state -------------------------------------------------
  const coins = ref(0);
  const user  = ref<User | null>(null);

  // actions -----------------------------------------------
  function setUser(newUser: User) {
    user.value = newUser;
    localStorage.setItem('user_uuid', newUser.uuid);
  }

  async function restoreUserFromLocalStorage() {
    const uuid = localStorage.getItem('user_uuid');
    if (!uuid) return;

    try {
      const res = await $fetch(`/api/user/${uuid}`);

      if (res.success && "data" in res) {
        setUser(res.data.user)
        return
      }
    } catch (err: any) {
      if (err.response?._data?.error === WebsocketErrors.PlayerNotFound) {
        // clear uuid from local storage
        localStorage.removeItem('user_uuid')
      } else {
        throw err;
      }
    }
  }

  // kick off the restore once;
  if (import.meta.client) {
    restoreUserFromLocalStorage();
  }

  return { coins, user, setUser, restoreUserFromLocalStorage };
});
