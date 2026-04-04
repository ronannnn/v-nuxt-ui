<script setup lang="ts">
import { useApp, useTheme } from '#v/composables'

const app = useApp()
const theme = useTheme()
</script>

<template>
  <UButton
    :icon="theme.sidebarSide.value === 'left' ? 'i-lucide-panel-left' : 'i-lucide-panel-right'"
    color="neutral"
    variant="ghost"
    aria-label="Toggle sidebar"
    @click="app.sidebarCollapsed.value = !app.sidebarCollapsed.value"
  />
</template>
