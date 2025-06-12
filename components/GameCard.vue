<script setup lang="ts">
import CardTemplate from '~/assets/icons/card_template.svg'
import type { Card } from '~/shared/types/cards'  

const props = withDefaults(
  defineProps<
    { animate?: boolean }
    & Omit<Card, 'type'>
    & { type: CardSuit | CARD_TYPE_CLASSIC }
  >(),
  { animate: true }
)

const emit = defineEmits<{
  (e: 'card:played', val: number): void
}>()

const positions = [
  [4,   8],
  [4,   78],
  [89, 8],
  [89, 78],
] as const

function getText(str: CardRank) {
  if(str === CardRank.ZEHN)
    return "10"
  if(str === CardRank.SIEBEN)
    return "7"

  return str.toString().substring(0, 1).toUpperCase()
}

const hoverClasses = computed(() => 
  props.animate 
    ? 'hover:scale-[1.02] hover:-translate-y-6 transition-transform cursor-pointer' 
    : ''
)
</script>

<template>
  <div class="relative" :class="hoverClasses">
    <CardTemplate
      @click="emit('card:played', id)"
      class="h-80 group-hover:shadow-xl"
    />
    <div
      v-for="(xy, i) in positions"
      :key="i"
      class="absolute font-bold text-black flex flex-col items-center"
      :style="{ top: `${xy[1]}%`, left: `${xy[0]}%` }"
    >
      <span>{{ getText(value) }}</span>
      <img
        :src="`/assets/card/symbols/${type.toLowerCase()}.svg`"
        class="h-4 mt-0.5"
        :alt="type"
        loading="lazy"
      />
    </div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black flex flex-col items-center text-5xl">
      <span>{{ getText(value) }}</span>
      <img
        :src="`/assets/card/symbols/${type.toLowerCase()}.svg`"
        class="h-12"
        :alt="type"
        loading="lazy"
      />
    </div>
  </div>
</template>