<script setup lang="ts">
import type { ResRoundState } from '~/shared/types/zod/actions/gameState';

// the shape you passed in: strip off success/action
type RoundData = Omit<
  Extract<ResRoundState, { success: true }>,
  'success' | 'action'
>['data']

const props = defineProps<{
  data: RoundData
}>()

const phaseLabel = computed(() => {
  const state = props.data.state

  switch (props.data.state) {
    case RoundState.REIZING:          return 'Bidding'
    case RoundState.TRUMP_SELECTION:  return 'Trump Selection'
    case RoundState.MELDING:          return 'Melding'
    case RoundState.PLAYING:          return 'Playing'
    default:                          return state
  }
})

// 2) turn-flag, whichever field applies
const isMyTurn = computed(() => {
  const d = props.data as any
  switch (props.data.state) {
    case RoundState.REIZING:         return d.isMyReizTurn
    case RoundState.TRUMP_SELECTION: return d.iCanSelectTrump
    case RoundState.MELDING:         return d.isMyMeldTurn
    case RoundState.PLAYING:         return d.isMyPlayTurn
    default:                         return false
  }
})


// 3) trump suit if present
const trump = computed<string | null>(() => {
  // only the MELDING and PLAYING variants have a `trump` field
  return (props.data as any).trump ?? null
})
</script>

<template>
  <div
    class="z-50
    space-y-2 bg-gray-900 rounded-md px-3 py-2"
  >
    <div class="space-x-4">
      <Tag
        :value="phaseLabel"
        severity="info"
        icon="pi pi-clock"
      />
      <Tag
        :value="isMyTurn ? 'Your Turn' : 'Waiting…'"
        :severity="isMyTurn ? 'success' : 'warning'"
        :icon="isMyTurn ? 'pi pi-play' : 'pi pi-pause'"
      />
      <Tag
        v-if="trump"
        :value="`Trump: ${trump}`"
        severity="help"
      />
    </div>
    
    <ProgressBar
      :value="50" class="h-5"
      v-show="isMyTurn"
    >
      {{ phaseLabel }} {{ $t("t") }}
    </ProgressBar>
  </div>
</template>