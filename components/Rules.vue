<script setup lang="ts">
const [isRulesVisible, toggleRules] = useToggle()

const steps = ['reizen', 'melden', 'spielen', 'zaehlen']
</script>

<template>
  <div>
    <Button label="Regeln" @click="toggleRules()"></Button>

    <Dialog v-model:visible="isRulesVisible" modal header="Spielregeln" :style="{ width: '50rem', height: '50rem' }">
      <Stepper :value="1">
        <StepList>
          <Step :value="index + 1" v-for="(step, index) in steps" :key="index">
            {{ $t(`binokel.rules.${step}.title`) }}
          </Step>
        </StepList>

        <StepPanels>
          <StepPanel v-for="(step, index) in steps" :key="index" v-slot="{ activateCallback }" :value="index + 1">
            <div class="flex flex-col min-w-48">
              <div class="border-2 border-surface-200 dark:border-surface-700
                 rounded bg-surface-50 dark:bg-surface-950 flex-auto flex justify-center
                 items-center font-medium p-4">
                <!-- Phase: Bidding (Reizen) -->
                <div v-if="step === 'reizen'">
                  <h3>{{ $t(`binokel.rules.${step}.title`) }}</h3>
                  <p>{{ $t(`binokel.rules.${step}.description`) }}</p>
                </div>

                <!-- Phase: Melding (Melden) -->
                <div v-else-if="step === 'melden'">
                  <h3>{{ $t(`binokel.rules.${step}.title`) }}</h3>
                  <p>{{ $t(`binokel.rules.${step}.intro`) }}</p>
                  <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li v-for="(combo, ci) in $t(`binokel.rules.${step}.combinations`)" :key="ci">
                      {{ combo }}
                    </li>
                  </ul>
                </div>

                <!-- Phase: Playing (Spielen) -->
                <div v-else-if="step === 'spielen'">
                  <h3>{{ $t(`binokel.rules.${step}.title`) }}</h3>
                  <ul class="list-disc pl-5 mt-2 space-y-1">
                    <li v-for="(ruleText, ri) in $t(`binokel.rules.${step}.rules`)" :key="ri">
                      {{ ruleText }}
                    </li>
                  </ul>
                </div>

                <!-- Phase: Scoring (Zählen) -->
                <div v-else-if="step === 'zaehlen'">
                  <h3>{{ $t(`binokel.rules.${step}.title`) }}</h3>
                  <p>{{ $t(`binokel.rules.${step}.description`) }}</p>
                </div>
              </div>
            </div>
            <div class="flex pt-6 justify-between">
              <Button label="Back" severity="secondary" icon="pi pi-arrow-left" v-show="index !== 0"
                @click="activateCallback(index)" />
              <Button label="Next" icon="pi pi-arrow-right" iconPos="right" v-show="index !== steps.length - 1"
                @click="activateCallback(index + 2)" />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>
    </Dialog>
  </div>
</template>