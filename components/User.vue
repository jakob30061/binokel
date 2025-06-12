<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useStore } from '~/store'
import { useToggle } from '@vueuse/core'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const store = useStore()
const router = useRouter()
const { t } = useI18n()
const [showUUID, toggle] = useToggle()
const localePath = useLocalePath()

const showDialog = ref(false)
const uuidInput = ref('')
const errorMsg = ref('')

// Show dialog if user is not set
function checkUser() {
  if (!store.user) {
    router.replace(localePath('/'))
    showDialog.value = true
  }
}

onMounted(() => {
  // Wait for store to restore user from localStorage
  setTimeout(checkUser, 100) // Adjust if needed
})

watch(() => store.user, (val) => {
  if (val) showDialog.value = false
})

// Try to verify pasted UUID
async function verifyUUID() {
  errorMsg.value = ''
  if (!uuidInput.value) {
    errorMsg.value = t('dialog.user.errorMsgUserNotFound')
    return
  }
  try {
    const res = await $fetch(`/api/user/${uuidInput.value}`)
    if (res.success && res.data?.user) {
      store.setUser(res.data.user)
      showDialog.value = false
    } else {
      errorMsg.value = t('dialog.user.errorMsgUserNotFound')
    }
  } catch {
    errorMsg.value = t('dialog.user.errorMsgVerificationError')
  }
}

// Create a new user
async function createNewUser() {
  errorMsg.value = ''
  try {
    const res = await $fetch('/api/user', {
      method: 'POST',
      body: { language: 'en' }
    })
    if (res?.data?.user) {
      store.setUser(res.data.user)
      showDialog.value = false
    } else {
      errorMsg.value = t('dialog.user.errorMsgCreationError')
    }
  } catch {
    errorMsg.value = t('dialog.user.errorMsgCreationError')
  }
}
</script>

<template>
  <div>
    <div v-show="showUUID" class="flex items-center gap-1">
      <p class="text-right dark:bg-slate-700 rounded-md p-3">
        {{ store.user?.uuid }}
      </p>
      <Button icon="pi pi-clone" class="aspect-square" aria-label="Copy" />
      <Button
        icon="pi pi-times" class="aspect-square" aria-label="Close"
        @click="toggle(false)"
      />
    </div>
    <Button
      icon="pi pi-user" class="aspect-square cursor-pointer" aria-label="User"
      @click="toggle(true)" v-show="!showUUID"
    />

    <!-- User Setup Dialog -->
    <Dialog
      v-model:visible="showDialog"
      modal
      :header="$t('dialog.user.setupHeader')"
      :closable="false"
    >
      <div class="flex flex-col gap-3">

        <!-- brief, muted explanation -->
        <p class="text-xs text-gray-500">
          <!-- keep the string in i18n so it’s easy to translate -->
          {{ $t('dialog.user.uuidHint') }}
        </p>

        <!-- paste existing UUID -->
        <label for="uuid-input">{{ $t('dialog.user.pasteUUIDLabel') }}</label>
        <InputText id="uuid-input" v-model="uuidInput" placeholder="UUID" />

        <!-- verify -->
        <Button
          :label="$t('dialog.user.verifyButtonLabel')"
          @click="verifyUUID"
        />

        <div class="text-center my-2">{{ $t('or') }}</div>

        <!-- create new UUID -->
        <Button
          :label="$t('dialog.user.createNewUserButtonLabel')"
          @click="createNewUser"
          severity="success"
        />

        <!-- validation / error -->
        <div v-if="errorMsg" class="text-red-500 mt-2">{{ errorMsg }}</div>
      </div>
    </Dialog>
  </div>
</template>