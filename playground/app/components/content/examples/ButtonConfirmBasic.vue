<script setup lang="ts">
const leftCount = ref(0)
const rightCount = ref(0)
</script>

<template>
  <div class="space-y-4">
    <div class="flex w-48 justify-end">
      <ProButtonConfirm
        class="rounded-md"
        :button="{
          icon: 'i-lucide-x',
          color: 'neutral',
          variant: 'outline'
        }"
        :confirm-button="{
          label: '确认',
          color: 'error',
          variant: 'subtle'
        }"
        @confirm="leftCount++"
      />
    </div>

    <div class="flex w-48 justify-start">
      <ProButtonConfirm
        :button="{
          label: '移除',
          color: 'neutral',
          variant: 'outline'
        }"
        :confirm-button="{
          label: '确认移除',
          color: 'error',
          variant: 'subtle'
        }"
        @confirm="rightCount++"
      />
    </div>

    <p class="text-sm text-muted">
      Confirmed: {{ leftCount + rightCount }}
    </p>
  </div>
</template>
