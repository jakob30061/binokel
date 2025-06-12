<script setup lang="ts">
import { useStore } from '~/store';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { useToast } from "primevue/usetoast";
import { z } from 'zod';
import type { ReqCreateGameData } from '#imports';

const  localePath  = useLocalePath()
const ws = useWebSocket();
const router = useRouter()
const store = useStore()

const [isCreateGameVisible, toggleCreateGameDialog] = useToggle()
const deckTheme = ref<CardDeck>(CardDeck.WUERTTEMBERGISCH)
const isPrivat = ref(false);
const password = ref<string | null>(null);

const gameFormSchema = z.object({
  maxPlayersSelector: z.union([z.literal(3), z.literal(4)],
  {
    error: 'Please choose 3 or 4 players'
  }),
  aiPlayerAmount: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)],
  {
    error: 'Please choose between 0 and 3 ai players'
  })
});
type GameFormValues = z.infer<typeof gameFormSchema>;

const toast = useToast();
const initialValues = ref<GameFormValues>({
  maxPlayersSelector: 3,
  aiPlayerAmount: 0,
});
const resolver = ref(zodResolver(gameFormSchema));

const onFormSubmit = ({ valid, values }: { valid: boolean, values: GameFormValues }) => {
  if (valid) {
    createGame(values)
    toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
  }
};

async function createGame(data: GameFormValues) {
  return new Promise((resolve, reject) => {
    if (!ws.value) {
      reject(new Error("WebSocket is not connected"));
      return;
    }

    // Create new Game
    ws.value.send(JSON.stringify({
      action: WebsocketTypes.CreateGame,
      data: {
        playerUUID: store.user?.uuid!, // TODO: not good
        maxPlayer: data.maxPlayersSelector,
        aiPlayer: data.aiPlayerAmount,
        password: isPrivat.value ? password.value : null, // TODO move into form as well

        rules: {
          deckTheme: deckTheme.value,
          rounds: 1 //TODO add logic
        }
      }
    } satisfies ReqCreateGameData));

    // Antwort vom WebSocket empfangen
    ws.value.onmessage = async (event) => {
      const msg = JSON.parse(await event.data)
      
      if(msg.action !== WebsocketTypes.CreateGame)
        return

      const res = ResCreateGame.parse(msg);

      if (res.success && res.data.game) {
        router.push(localePath(`/game/${res.data.game.pin}`))
        resolve(res.data);
      } else {
        reject(new Error("Invalid game response"));
      }
    };

    toggleCreateGameDialog(false);
  });
}
</script>

<template>
  <div>
    <NuxtLayout>
      <!-- Lobby and Join Game
           Link to rules, Create game
      -->
      <div class="grid place-items-center h-screen gap-8 w-full">
        <div class="grid place-items-center">
          <div class="flex flex-col md:flex-row">
            <JoinGame />

            <div class="w-full md:w-2/12">
              <div  class="hidden md:flex h-full">
                <Divider layout="vertical">
                  <b>{{ $t('or').toUpperCase() }}</b>
                </Divider>
              </div>
              <div class="flex md:hidden h-full">
                <Divider layout="horizontal" align="center">
                  <b>{{ $t("or").toUpperCase() }}</b>
                </Divider>
              </div>
            </div>

            <div class="w-full md:w-5/12 flex items-center justify-center py-5">
              <Button :label="$t('binokel.createGame')" icon="pi pi-plus" @click="toggleCreateGameDialog()" />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        v-model:visible="isCreateGameVisible" modal
        header="Create Binokel Game"
      >
        <Form
          v-slot="$form" :resolver="resolver"
          :initialValues="initialValues"
          @submit="onFormSubmit" class="flex flex-col gap-4"
        >
          <div class="space-y-3">
            <!-- <span class="text-surface-500 dark:text-surface-400 block mb-8">{{ $t('binokel.createGameDialog.selectDecktheme') }}</span>
            <div class="flex justify-center gap-4">
              <GameCard
                :id="1" :value="CardRank.ASS"
                :type="CARD_TYPE_CLASSIC.Kreuz" :copy="CardCopy.A"
                @click="deckTheme = CardDeck.FRENCH"
                :class="{  }"
              />
              <GameCard
                :id="2" :value="CardRank.ASS"
                :type="CardSuit.EICHEL" :copy="CardCopy.A"
                @click="deckTheme = CardDeck.WUERTTEMBERGISCH"
              />
            </div> -->

            <div class="card grid gap-2">
              <span class="text-surface-500 dark:text-surface-400 block">
                {{ $t('binokel.createGameDialog.playerAmount') }}
              </span>
              <div class="card flex justify-center w-full">
                <SelectButton
                  :options="[3, 4]"
                  class="w-full full-width-select"
                  :defaultValue="3"
                  :allowEmpty=false
                  size="large"
                  name="maxPlayersSelector"
                />
                <Message
                  v-if="$form.maxPlayersSelector?.invalid"
                  severity="error"
                >
                  {{ $form.maxPlayersSelector.error?.message }}
                </Message>
              </div>

              <span class="text-surface-500 dark:text-surface-400 block">
                {{ $t('binokel.createGameDialog.aiPlayer') }}
              </span>
              <div class="card flex justify-center w-full">
                <SelectButton
                  :options="$form.maxPlayersSelector?.value === 3 ? [0, 1, 2] : [0, 1, 2, 4]"
                  :defaultValue="0"
                  class="w-full full-width-select"
                  :allowEmpty=false
                  size="large"
                  name="aiPlayerAmount"
                />
              </div>

              <span class="text-surface-500 dark:text-surface-400 block">
                {{ $t('binokel.createGameDialog.makeGamePrivate') }}
              </span>
              <div class="grid gap-3">
                <ToggleButton
                  :v-tooltip.top="$t('binokel.createGameDialog.publicGame.tooltip')"
                  type="button" v-model="isPrivat" :onLabel="$t('binokel.createGameDialog.publicGame.onLabel')"
                  :offLabel="$t('binokel.createGameDialog.publicGame.offLabel')" onIcon="pi pi-lock"
                  offIcon="pi pi-lock-open" class="w-full"
                />
                <Transition name="fade">
                  <Password
                    v-model="password" :feedback="false" placeholder="Password"
                    v-show="isPrivat"
                  />
                </Transition>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="toggleCreateGameDialog() "></Button>
            <Button type="submit" label="Save"></Button>
          </div>
        </Form>
      </Dialog>
    </NuxtLayout>
  </div>
</template>
