<script setup lang="ts">
const text = ref('Confidential')
const multiLine = ref(false)
const fontSize = ref(13)
const rotate = ref(-16)
const gap = ref(128)
const opacity = ref(0.6)
const disabled = ref(false)

const displayText = computed(() => multiLine.value ? ['V Nuxt UI', 'Confidential'] : text.value)
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <div class="flex flex-wrap gap-4 items-center">
      <UFormField label="Text">
        <UInput v-model="text" class="w-36" />
      </UFormField>
      <USwitch v-model="multiLine" label="Multi-line" />
      <UFormField label="Font Size">
        <UInput v-model.number="fontSize" type="number" class="w-20" />
      </UFormField>
      <UFormField label="Rotate">
        <UInput v-model.number="rotate" type="number" class="w-20" />
      </UFormField>
      <UFormField label="Gap">
        <UInput v-model.number="gap" type="number" class="w-20" />
      </UFormField>
      <UFormField label="Opacity">
        <UInput
          v-model.number="opacity"
          type="number"
          step="0.1"
          min="0"
          max="1"
          class="w-20"
        />
      </UFormField>
      <USwitch v-model="disabled" label="Disabled" />
    </div>

    <USeparator />

    <ProWatermark
      :text="displayText"
      :font-size="fontSize"
      :rotate="rotate"
      :gap="gap"
      :opacity="opacity"
      :disabled="disabled"
    >
      <div class="p-8 space-y-4 min-h-48">
        <p class="text-lg font-semibold">
          This is protected content
        </p>
        <p class="text-muted">
          The watermark overlay prevents unauthorized screenshots and sharing. You can customize the text, rotation, opacity, and spacing.
        </p>
        <p class="text-muted">
          Try adjusting the controls above to see how the watermark changes.
        </p>
      </div>
    </ProWatermark>
  </div>
</template>
