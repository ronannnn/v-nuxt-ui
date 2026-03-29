<script setup lang="ts">
const variant = ref<'naked' | 'outline'>('naked')
const icon = ref('i-lucide-inbox')
const title = ref('暂无数据')
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <div class="flex flex-wrap gap-4 items-center">
      <UFormField label="Variant">
        <USelect v-model="variant" :items="['naked', 'outline']" class="w-32" />
      </UFormField>
      <UFormField label="Icon">
        <USelect v-model="icon" :items="['i-lucide-inbox', 'i-lucide-search', 'i-lucide-file-x', 'i-lucide-database']" class="w-48" />
      </UFormField>
      <UFormField label="Title">
        <UInput v-model="title" class="w-40" />
      </UFormField>
    </div>

    <USeparator />

    <div class="flex justify-center py-8">
      <ProEmpty :variant="variant" :icon="icon" :title="title" />
    </div>
  </div>
</template>
