<script setup lang="ts">
import type { ReqSetTrumpData } from '#imports';
import Dialog from 'primevue/dialog'
import { useStore } from '~/store'

const emit = defineEmits<{
  (e: 'closeDialog'): void
}>()

const ws = useWebSocket()
const store = useStore()
const route = useRoute()

const gamePin = ref(route.params.slug)

const visible = defineModel<boolean>('visible');
const SUITS = Object.values(CardSuit);

async function setTrumpSuit(suit: CardSuit) {
  ws.value?.send(JSON.stringify({
    action: WebsocketTypes.SetTrump,
    data: {
      playerUUID: store.user?.uuid!, // TODO not good
      gamePin: gamePin.value?.toString()!, // TODO not good
      trump: suit
    }
  } satisfies ReqSetTrumpData))
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="$t('dialog.trump.header')"
    :closable="false"
  >
    <span>Select the Trump Suit</span>
    <div class="flex gap-5 mt-4">
      <img
        v-for="type in SUITS"
        :src="`/assets/card/symbols/${type.toLowerCase()}.svg`"
        class="h-24 mt-0.5 cursor-pointer hover:scale-105 transition-transform"
        :alt="type"
        @click="setTrumpSuit(type)"
        loading="lazy"
      />
    </div>
  </Dialog>
</template>