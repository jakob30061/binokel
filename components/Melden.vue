<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useStore } from '~/store';
import type { ReqMakeMeldData } from '#imports';

const props = defineProps<{
  handCards: Card[],
  trumpSuit: CardSuit
}>();

const possibleMelds = await findAllMelds(
  props.handCards,
  props.trumpSuit
)

const visible = defineModel<boolean>('visible');
const selected = ref<Meld[]>([])

const displayMelds = computed(() => {
  return [...possibleMelds]
    .map((m, i) => ({ ...m, id: i }))   // add a unique `id` per meld
    .sort((a, b) => b.points - a.points);
})

const totalPoints = computed(() =>
  selected.value.reduce((sum, m) => sum + m.points, 0)
)

const ws = useWebSocket()
const store = useStore()
const route = useRoute()

const gamePin = ref(route.params.slug)

async function sendMeldData() {
  ws.value?.send(JSON.stringify({
    action: WebsocketTypes.MakeMeld,
    data: {
      playerUUID: store.user?.uuid!, // TODO not good
      gamePin: gamePin.value?.toString()!, // TODO not good
      totalPoints: totalPoints.value,
      melds: selected.value
    }
  } satisfies ReqMakeMeldData))
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    header="Meldungen"
    :closable="false"
    style="width: 400px"
  >
    <DataTable
      :value="displayMelds"
      v-model:selection="selected"
      selectionMode="multiple"
      dataKey="id"
      class="p-mb-3"
      :sortField="'points'"
      :sortOrder="-1"
    >
      <Column selectionMode="multiple" style="width: 3em"></Column>

      <!-- Meld name -->
      <Column field="name" header="Meldung"/>

      <!-- Punktwert -->
      <Column field="points" header="Punkte" style="width: 5em"/>

      <!-- (optional) show the cards in that meld -->
      <Column header="Karten" :body="(row: Meld) => row.cards.map(c => c.value[0]).join(', ')" />
    </DataTable>

    <!-- 3) summary and action buttons -->
    <div class="flex align-items-center justify-content-between p-mt-2">
      <div>
        Gesamt: <strong>{{ totalPoints }}</strong>
      </div>

      <Button label="OKAY" severity="success" @click="sendMeldData" :disabled="!selected.length" />
    </div>
  </Dialog>
</template>