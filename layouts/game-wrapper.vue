<script setup lang="ts">
const [isChatVisible, toggleChat] = useToggle(false)
const [isHelperVisible, toggleHelper] = useToggle(false)
</script>

<template>
  <div>
    <Splitter style="height: 100vh">
      <SplitterPanel class="relative flex items-center justify-center" :size="75" :minSize="10">
        <slot></slot>
      </SplitterPanel>

      <SplitterPanel
        :size="25" :minSize="10" v-show="isChatVisible"
        class="flex items-center justify-center"
      >
        <Chat v-show="isChatVisible" />
      </SplitterPanel>
    </Splitter>

    <Teleport to="body">
      <nav
        class="fixed inset-x-0 top-6 z-50 flex items-center justify-center"
      >
        <Rules class="absolute left-6" />

        <slot name="nav-center" />
        
        <User class="absolute right-6" />
      </nav>

      <Helper v-show="isHelperVisible" />
    </Teleport>
  </div>
</template>