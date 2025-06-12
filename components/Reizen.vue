<script setup lang="ts">
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { useStore } from '~/store';
import type { ReqReizenData } from '#imports';

const emit = defineEmits<{
  (e: 'closeDialog'): void
}>()

const props = defineProps<{
  reizValueProp: number;
}>();

const visible = defineModel<boolean>('visible');
const reizValuePropRef = toRef(props, 'reizValueProp');
const reizValue = ref<number>(reizValuePropRef.value);
watch(reizValuePropRef, (newVal) => {
  reizValue.value = newVal;
});

const ws = useWebSocket()
const store = useStore()
const route = useRoute()

const gamePin = ref(route.params.slug)

function sendReiz(passed: boolean = false) {
  if(reizValue.value <= props.reizValueProp && !passed)
    return

  ws.value?.send(JSON.stringify({
    action: WebsocketTypes.Reizen,
    data: {
      gamePin: gamePin.value.toString(),
      playerUUID: store.user?.uuid!, // TODO not safe
      amount: (passed ? undefined : reizValue.value),
      pass: passed
    }
  } satisfies ReqReizenData))
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="$t('dialog.reizen.header')"
    :closable="false"
  >
    <div class="flex flex-col gap-5">
      <div class="flex gap-3">
        <Button
          :label="$t('dialog.reizen.decrease10')"
          v-show="reizValue >= reizValueProp + 10"
          @click="reizValue -= 10"
          severity="success"
        />
        <InputNumber id="uuid-input" v-model="reizValue" :placeholder="$t('dialog.reizen.inputPlaceholder')" :min="reizValue" :max="3000"/>
        <Button
          :label="$t('dialog.reizen.increase10')"
          @click="reizValue += 10"
          severity="success"
        />
      </div>

      <div class="flex justify-between gap-3">
        <Button
          :label="$t('dialog.reizen.dropOut')"
          @click="sendReiz(true)"
          class="flex-1"
          severity="danger"
        />
        <Button
          :label="$t('dialog.reizen.submitMeld')"
          @click="sendReiz()"
          :disabled="reizValue <= reizValueProp"
          class="flex-1"
          severity="success"
        />
      </div>
    </div>
  </Dialog>
</template>