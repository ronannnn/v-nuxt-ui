<script setup lang="ts">
defineProps<{
  title: string
  backgroundImage: string
  backgroundImageClass?: string
  logo: string
  logoClass?: string
}>()
</script>

<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center px-3">
    <img
      :src="backgroundImage"
      alt="Veken Building"
      class="absolute w-screen h-screen object-cover object-left opacity-8"
      :class="backgroundImageClass"
    >
    <UCard class="w-full max-w-md z-10">
      <template #header>
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <img
            :src="logo"
            alt="Veken Logo"
            class="h-9"
            :class="logoClass"
          >
          <div class="font-bold text-lg">
            {{ title }}
          </div>
        </div>
      </template>
      <slot />
    </UCard>
  </div>
</template>
