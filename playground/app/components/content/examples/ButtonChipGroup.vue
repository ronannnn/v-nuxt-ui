<script setup lang="ts">
const chipDisabled = ref(false)
</script>

<template>
  <div class="space-y-4">
    <USwitch v-model="chipDisabled" label="Disabled" />
    <div class="flex flex-wrap gap-2">
      <ProButtonChip label="Active" color="#22c55e" :disabled="chipDisabled" :on-click="() => {}" />
      <ProButtonChip label="Warning" color="#f59e0b" :disabled="chipDisabled" :on-click="() => {}" />
      <ProButtonChip label="Error" color="#ef4444" :disabled="chipDisabled" :on-click="() => {}" />
      <ProButtonChip label="Info" color="#3b82f6" :disabled="chipDisabled" :on-click="() => {}" />
    </div>
  </div>
</template>
