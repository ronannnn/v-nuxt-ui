<script setup lang="ts">
const arcs = ref([
  { percent: 40, color: 'primary' as const },
  { percent: 30, color: 'success' as const },
  { percent: 20, color: 'warning' as const },
  { percent: 10, color: 'error' as const }
])

const text = ref('75%')
const strokeWidth = ref(2)
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <div class="flex flex-wrap gap-4 items-center">
      <UFormField label="Center Text">
        <UInput v-model="text" class="w-24" />
      </UFormField>
      <UFormField label="Stroke Width">
        <UInput
          v-model.number="strokeWidth"
          type="number"
          min="1"
          max="10"
          class="w-20"
        />
      </UFormField>
    </div>

    <USeparator />

    <div class="flex justify-center gap-8 py-4">
      <div class="w-24 h-24">
        <ProCircleProgress :arcs="arcs" :text="text" :stroke-width="strokeWidth" />
      </div>
      <div class="w-24 h-24">
        <ProCircleProgress
          :arcs="[{ percent: 100, color: 'success' }]"
          text="100%"
          text-color="success"
          :stroke-width="strokeWidth"
        />
      </div>
      <div class="w-24 h-24">
        <ProCircleProgress
          :arcs="[{ percent: 60, color: 'warning' }, { percent: 40, color: 'neutral' }]"
          text="60%"
          text-color="warning"
          :stroke-width="strokeWidth"
        />
      </div>
    </div>
  </div>
</template>
