<script setup lang="ts">
import type { ReqJoinGameData } from '#imports';
import { useStore } from '~/store';

const gamePin = ref<string>('')
const password = ref<string>('')
const isPasswordProtected = ref<boolean>(false)

const toast = useToast()
const router = useRouter()
const store = useStore()
const ws = useWebSocket()
const localePath = useLocalePath()

async function submitGamePin() {
	return new Promise((resolve, reject) => {
    if (!ws.value) {
      reject(new Error("WebSocket is not connected"));
      return;
    }

    // Nachricht senden
    ws.value.send(JSON.stringify({
      action: WebsocketTypes.JoinGame,
      data: {
				gamePin: gamePin.value,
				playerUUID: store.user?.uuid! // TODO not good
			}
    } satisfies ReqJoinGameData));

		ws.value.onmessage = async (event) => {
			const msg = JSON.parse(await event.data)
			console.log(msg);
			
			if(msg.action !== WebsocketTypes.JoinGame && msg.action !== WebsocketTypes.JoinGameWithPassword)
				return

			if(!msg.success)
				return toast.add({
					severity: 'error', summary: msg.error, // TODO translate error
					detail: ``, life: 3000
				});
			
      const body = ResJoinGame.parse(msg);

			if(body.success === false)
				return toast.add({
					severity: 'error', summary: `Code "${gamePin.value}" not found`,
					detail: `Are you sure this game exists?`, life: 3000
				});

      if (body.data.passwordProtected) {
				isPasswordProtected.value = true
      } else {
				router.push(localePath(`/game/${body.data.gamePin}`))
      }
    };
  });
};

async function enterPassword() {
	return new Promise((resolve, reject) => {
    if (!ws.value) {
      reject(new Error("WebSocket is not connected"));
      return;
    }

    // Nachricht senden
    ws.value.send(JSON.stringify({
      action: WebsocketTypes.JoinGameWithPassword,
      data: {
				password: password.value,
				gamePin: gamePin.value,
				playerUUID: store.user?.uuid! // TODO not good
			}
    } satisfies JoinGameWithPassword));

		ws.value.onmessage = async (event) => {
      const data = JSON.parse(await event.data);     
			console.log(data);

			if(data.success === false)
				return toast.add({
					severity: 'error', summary: data.error,
					detail: ``, life: 3000
				});

			router.push(localePath(`/game/${gamePin.value}`))
    };
  });
}

const is_valid_game_id = computed<boolean | undefined>(() => {
	if (gamePin.value.length === 5)
		return false

	return true
})
</script>

<template>
	<div class="space-y-3">
		<Toast />

		<InputOtp v-model="gamePin" :length="5" />
		<Button severity="secondary" label="Eingabe" class="w-full" @click="submitGamePin"
			:disabled="is_valid_game_id"></Button>
	</div>

	<Dialog v-model:visible="isPasswordProtected" modal :header="$t('dialog.password.header')" :style="{ width: '25rem' }">
		<span class="text-surface-500 dark:text-surface-400 block mb-8">
			{{ $t('dialog.password.content') }}
		</span>
		<div class="flex items-center gap-4 mb-4">
			<label for="password" class="font-semibold w-24">
				{{ $t('dialog.password.inputLabel') }}
			</label>
			<Password v-model="password" id="password" class="flex-auto" :feedback="false" autocomplete="off" />
		</div>
		<div class="flex justify-end gap-2">
			<Button type="button" :label="$t('dialog.cancel')" severity="secondary" @click="isPasswordProtected = false"></Button>
			<Button type="button" :label="$t('dialog.enter')" @click="enterPassword"></Button>
		</div>
	</Dialog>
</template>