<script setup lang="ts">
defineProps<{
  to?: string
}>();
</script>

<template>
  <main class="h-screen w-screen">
    <User class="position absolute top-6 right-6 z-50" />

    <slot></slot>
  </main>
</template>