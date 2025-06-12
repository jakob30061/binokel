<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '~/store'
import { useToggle } from '@vueuse/core'
import { ResNewPlayerJoined } from '~/shared/types/zod/actions/joinGame'
import type z from 'zod'

const ws = useWebSocket()
const route = useRoute()
const router = useRouter()
const store = useStore()
const toast = useToast()

const [showTrumpSelectorDialog, toggleTrumpDialog] = useToggle(false)
const [showReizenDialog, toggleReizenDialog] = useToggle(false)
const [showMeldenDialog, toggleMeldenDialog] = useToggle(false)

const gamePin = ref(route.params.slug)

const gameState = ref<RoundState>(RoundState.WAITING_FOR_PLAYERS)
const waitingState = ref<{ players: number, maxPlayers: number } | null>(null)

type GameData = Omit<Extract<ResRoundState, { success: true }>, 'success' | 'action'>['data'];
const gameData = ref<GameData | null>(null)

const trump = ref<CardSuit | null>(null)

function sendAction(action: WebsocketTypes, data: any) { //TODO better type
  ws.value?.send(JSON.stringify({
    action,
    data: { ...data, playerUUID: store.user?.uuid }
  }))
}

async function handleMessage(event: MessageEvent) {
  let raw = event.data;
  let msg: any;

  if (raw instanceof Blob) {
    const text = await raw.text();
    msg = JSON.parse(text);
  }
  else if (typeof raw === "string") {
    msg = JSON.parse(raw);
  }
  else {
    msg = raw;
  }

  switch (msg.action) {
    case WebsocketTypes.PlayerIsInGame: { // TODO Move into middleware 
      const body = ResPlayerIsInGame.parse(msg)
      if(body.success) {
        waitingState.value = {
          players: body.data.playerCount,
          maxPlayers: body.data.maxPlayers
        }
        return
      }

      if(body.error === WebsocketErrors.NoValidGamePin)
      	toast.add({
					severity: 'error', summary: `Code "${gamePin}" not found`,
					detail: `Are you sure this game exists?`, life: 3000
				});
      
      return router.replace('/')
    }

    case WebsocketTypes.NEW_PLAYER_JOINED: {
      const body = ResNewPlayerJoined.parse(msg)
      if(body.success) {
        waitingState.value = {
          players: body.data.currentPlayerCount,
          maxPlayers: body.data.playerCount
        }
        return
      }

      break;
    }

    case WebsocketTypes.GameState: {
      const body = ResRoundState.parse(msg)
      if(body.success) {
        gameData.value = body.data
        gameState.value = body.data.state

        if(gameData.value.state === RoundState.REIZING)
          toggleReizenDialog(gameData.value.isMyReizTurn)

        if(gameData.value.state === RoundState.TRUMP_SELECTION)
          toggleTrumpDialog(gameData.value.iCanSelectTrump)

        if(gameData.value.state === RoundState.MELDING)
          toggleMeldenDialog(gameData.value.isMyMeldTurn)
      }

      break;
    }

    case WebsocketTypes.SetTrump: {
      const body = ResTrumpData.parse(msg)
      if(body.success) {
        trump.value = body.data.trump
        toggleTrumpDialog(false)
        return
      }

      break;
    }

    case WebsocketTypes.MakeMeld: {
      const body = ResMeldData.parse(msg)
      if(body.success) {
        toggleMeldenDialog(body.data.isMyTurnToMeld === store.user?.uuid)
        return
      }

      break;
    }

    case WebsocketTypes.PLAYED_CARD_ACCEPTED: {
      const body = ResCardPlayedAccepted.parse(msg)
      if(body.success && gameData.value?.state === RoundState.PLAYING) {
        const idx = gameData.value.cards.own.findIndex(c => c.id === body.data.card.id)
        if (idx !== -1) {
          gameData.value.cards.own.splice(idx, 1)
        }
        return
      }

      break;
    }

    case WebsocketTypes.PLAY_CARD: {
      const body = ResCardPlayed.parse(msg)
      if(body.success && gameData.value?.state === RoundState.PLAYING) {
        gameData.value.cards.table = body.data.table
        gameData.value.isMyPlayTurn = body.data.isMyPlayTurn
        return
      }

      break;
    }

    case WebsocketTypes.StartGame: {
      const body = ResRoundState.parse(msg)
      if(body.success) {
        gameState.value = body.data.state
        gameData.value = body.data
        return
      }

      break;
    }

    case WebsocketTypes.Reizen: {
      const body = ResReizen.parse(msg)
      if(body.success) {
        if(body.data.playerUUID === store.user?.uuid) {
          toggleReizenDialog(false)
        }
        return
      }

      break;
    }
  
    default:
      break;
  }
}

onMounted(() => {
  ws.value?.addEventListener('message', handleMessage)

 if (store.user) {
    sendAction(WebsocketTypes.PlayerIsInGame, { gamePin: gamePin.value })
    return
  }

  const stop = watch(
    () => store.user,
    (user) => {
      if (user) {
        sendAction(WebsocketTypes.PlayerIsInGame, { gamePin: gamePin.value })
        stop()
      }
    }
  )
})

onBeforeUnmount(() => {
  ws.value?.removeEventListener('message', handleMessage)
})

const positionClass = (index: number) => {
  const sides = [
    'absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center',
    'absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 flex flex-col items-center',
    'absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center',
  ]
  return sides[index] || ''
}

// small-screen overlap, reset at md
const overlapClass = (index: number) => {
  // for first two (vertical stacks) we want -mt-10, for third (horizontal) -ml-10
  if (index === 0 || index === 1) {
    return '-mt-10 md:mt-0'
  }
  if (index === 2) {
    return '-mt-12'
  }
  return ''
}

// rotation stays the same
const rotationClass = (index: number) => {
  const rots = [
    'rotate-90 w-auto',   // left side
    '-rotate-90 w-auto',  // right side
    'rotate-180 w-auto',  // top side
  ]
  return rots[index] || ''
}

function playCard(card: Card) {
  // check if our turn
  if(
    !(gameData.value?.state === RoundState.PLAYING
    && gameData.value.isMyPlayTurn)
  )
    return

  
  sendAction(
    WebsocketTypes.PLAY_CARD,
    {
      playerUUID: store.user?.uuid!, // TODO not good
      gamePin: gamePin.value?.toString()!, // TODO not good
      card: card
    } satisfies z.infer<typeof PlayCardData>['data']
  )
}

const rows = computed(() => {
  if (!gameData.value) return { backRow: [], frontRow: [] }

  let displayCards: Array<Card & { disabled?: boolean }> = gameData.value.cards.own
  if (gameData.value.state === RoundState.PLAYING && gameData.value.isMyPlayTurn) {
    const possibleIds = new Set(
      getPossibleMoves(
        gameData.value.cards.own,
        gameData.value.trump,
        gameData.value.cards.table
      ).map(c => c.id)
    )
    displayCards = gameData.value.cards.own.map(c => ({
      ...c,
      disabled: !possibleIds.has(c.id),
    }))
  }

  if (displayCards.length < 4) {
    return { frontRow: displayCards, backRow: [] }
  }

  const half = Math.ceil(displayCards.length / 2)
  return {
    backRow:  displayCards.slice(0, half),
    frontRow: displayCards.slice(half),
  }
})

</script>

<template>
  <NuxtLayout name="game-wrapper">
    <template
      #nav-center
      v-if="gameState !== RoundState.WAITING_FOR_PLAYERS && gameData"
    >
      <StateInfo :data="gameData" />
    </template>

    <div v-if="gameState === RoundState.WAITING_FOR_PLAYERS && waitingState">
      <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <div class="text-lg font-semibold">Warte auf Mitspieler...</div>
        <div>
          <span class="font-mono">
            ({{ waitingState.players }}/{{ waitingState.maxPlayers }})
          </span>
        </div>
      </div>
    </div>

    <div v-else-if="gameState !== RoundState.WAITING_FOR_PLAYERS && gameData">
      <Reizen
        v-if="gameData.state === RoundState.REIZING"
        v-model:visible="showReizenDialog"
        :reizValueProp="gameData.currentValue"
        @closeDialog="toggleReizenDialog(false)"
      />
      <Melden
        v-if="gameData.state === RoundState.MELDING"
        v-model:visible="showMeldenDialog"
        :hand-cards="gameData.cards.own"
        :trump-suit="gameData.trump"
        @closeDialog="toggleMeldenDialog(false)"
      />
      <TrumpSelector
        v-if="gameData.state === RoundState.TRUMP_SELECTION"
        v-model:visible="showTrumpSelectorDialog"
        @closeDialog="toggleTrumpDialog(false)"
      />

      <!-- Opponent hands -->
      <div
        v-for="(opponent, idx) in gameData.cards.opponents"
        :key="idx"
        :class="positionClass(idx)"
      >

      <!-- change w for card size; change h for space between cards -->
        <div
          v-for="card in opponent.cards"
          class="w-36 h-16 pointer-events-none" 
            >
            <img
              src="~/assets/images/card_back.png"
              alt="Opponent card"
              :class="[
                rotationClass(idx),
                overlapClass(idx),
              ]"
            />

        </div>
      </div>

      <div class="flex justify-center items-center w-full h-full">
        <!-- Card stack in the middle of the table -->
        <div class="relative">
          <div
            v-for="(card, index) in gameData.cards.table" :key="card.id"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <GameCard
              :id="card.id"
              :value="card.value"
              :type="card.type"
              :copy="card.copy"
              :animate="false"
              :class="`-rotate-${index * 15}`"
            />
          </div>
        </div>
      </div>

      <div class="absolute inset-x-0 flex flex-col items-center -bottom-40">
        <!-- back row (slightly behind) -->
        <div class="flex justify-center space-x-3 -mb-40 relative z-0">
          <GameCard
            v-for="card in rows?.backRow"
            :key="card.id"
            :id="card.id" :copy="card.copy"
            :value="card.value"
            @click="playCard(card)"
            :class="{ disabled: card.disabled }"
            :blatt="gameData.cards.blatt"
            :type="card.type"
            class="game-card"
          />
        </div>

        <!-- front row (on top) -->
        <div class="flex justify-center space-x-3 relative z-10">
          <GameCard
            v-for="card in rows?.frontRow"
            :key="card.id"
            :id="card.id" :copy="card.copy"
            :value="card.value"
            class="game-card"
            @click="playCard(card)"
            :class="{ disabled: card.disabled }"
            :blatt="gameData.cards.blatt"
            :type="card.type"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.game-card {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
}

.game-card.disabled {
  filter: grayscale(100%);
  pointer-events: none;
}

.game-card.disabled::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  /* Rundung übernehmen */
  border-radius: inherit;
  pointer-events: none;
}
</style>
