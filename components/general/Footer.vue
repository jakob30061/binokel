<script setup lang="ts">
import GithubIcon from '~/assets/icons/companies/github-solid.svg'
import InstaIcon from '~/assets/icons/companies/instagram.svg'

</script>

<template>
  <footer class="mx-6 my-2 relative z-10">
    <div class="flex gap-3 justify-between">
      <div class="flex gap-4">
        <NuxtLink
          :href="'https://github.com/jakob30061'"
          target="_blank" aria-label="jakob30061 github link"
        >
          <GithubIcon class="w-6 h-6"/>
        </NuxtLink>
        <NuxtLink
          :href="'https://www.instagram.com/jakob30061'"
          target="_blank" aria-label="jakob30061 instagram link"
        >
          <InstaIcon class="w-6 h-6"/>
        </NuxtLink>
      </div>

      <div class="space-x-3">
        <NuxtLink :href="'/imprint'" class="dark:text-gray-100 custom-underline text-md">
          {{ $t('footer.imprint') }}
        </NuxtLink>
        <NuxtLink :href="'/privacy-policy'" class="dark:text-gray-100 custom-underline text-md">
          {{ $t('footer.privacy_policy') }}
        </NuxtLink>
      </div>
    </div>
    <slot></slot>
  </footer>
</template>