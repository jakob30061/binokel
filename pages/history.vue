<script setup lang="ts">
const  localePath  = useLocalePath()
</script>

<template>
  <div>
    <NuxtLayout to="">
      <NuxtLink :to="localePath('binokel')">
        <Button
          icon="pi pi-chevron-left" aria-label="Back"
          class="position absolute top-6 left-6 aspect-square z-40"
        />
      </NuxtLink>

      <p>
        Entstanden ist das Spiel aus den französischen Kartenspielen Bézique und Cinq-Cents. Es wird auch in den Vereinigten Staaten gespielt, dort ist es unter dem Namen Pinochle bekannt und mit verschiedenen Regeln bzw. 2-mal 32 Karten des französischen Blatts statt 2-mal 20 oder 24 Karten des deutschen Blatts.

        Der Name kommt vermutlich von dem Italienischen bin oculi (= zwei Augen), weil mit einem doppelten Blatt gespielt wird. 
      </p>
    </NuxtLayout>
  </div>
</template>