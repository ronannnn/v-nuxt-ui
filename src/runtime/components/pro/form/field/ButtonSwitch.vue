<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean
  yesLabel?: string
  noLabel?: string
}>(), {
  yesLabel: '是',
  noLabel: '否'
})
const value = defineModel<boolean | undefined | null>('modelValue', { required: true })
</script>

<template>
  <UFieldGroup class="w-full">
    <UButton
      :label="yesLabel"
      :disabled="disabled"
      :color="value === true ? 'primary' : 'neutral'"
      :variant="value === true ? 'subtle' : 'outline'"
      block
      @click="value = true"
    />
    <UButton
      :label="noLabel"
      :disabled="disabled"
      :color="value === false ? 'primary' : 'neutral'"
      :variant="value === false ? 'subtle' : 'outline'"
      block
      @click="value = false"
    />
  </UFieldGroup>
</template>
