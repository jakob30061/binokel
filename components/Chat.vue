<script setup lang="ts">
import { codeToHtml } from 'shiki';

interface Message {
  id: number;
  user: string;
  text: string;
  formattedText: string;
  date: string;
  _fmt?: boolean;
}

const message = ref('');
const messages = reactive<Message[]>([]);
const rand = Math.random();
</script>

<template>
  <div></div>
  <div class="grid">
    <!-- Messages -->
    <div class="flex-grow flex flex-col justify-end gap-4 px-4 py-8">
      <div class="flex items-center gap-2 bg-primary text-primary-contrast animate-duration-1000" v-animateonscroll="{ enterClass: 'animate-fadein', leaveClass: 'animate-fadeout' }" v-for="message in messages" :key="message.id">
        <div class="grid place-items-center gap-1">
          <Avatar
            :image="`https://www.gravatar.com/avatar/${encodeURIComponent(message.user + rand)}?s=512&d=monsterid`"
            size="large" shape="circle"
          />
          <p class="text-gray-500 text-xs">{{ message.user }}</p>
        </div>

        <div>
          <div class="ml-2 bg-gray-800 rounded-lg p-2 w-fit">
            <p v-if="message.formattedText" class="overflow-x-scroll" v-html="message.formattedText"></p>
            <p v-else class="text-white">{{ message.text }}</p>
          </div>
          <p class="text-gray-500 mt-1 text-right text-xs">{{ message.date }}</p>
        </div>
      </div>
    </div>

    <!-- Chatbox -->
    <div class="bg-gray-800 px-4 py-2 flex items-center justify-between bottom-0 w-full">
      <IconField>
        <InputText
          type="text" v-model="message"
          placeholder="Type your message..."
          @keydown.enter="send(message)" class="w-full"
        />
        <InputIcon class="pi pi-send" @click="send(message)"/>
      </IconField>
    </div>
  </div>
</template>

<style>
body {
  background-color: #1a1a1a;
}
</style>