<script setup lang="ts" generic="T extends Model.BaseModel">
import type { CreateModalFormTemplateProps } from '../../../../types'

const props = withDefaults(defineProps<CreateModalFormTemplateProps<T>>(), {
  rowKey: 'id'
})

const form = useTemplateRef('form')

const action = computed(() => props.modelValue[props.rowKey] === 0 ? '创建' : '更新')
const titleWithAction = computed(() => `${action.value}${props.title}`)
const descWithAction = computed(() => props.description ?? `请${action.value}${props.title}`)
const submitIcon = computed(() => props.modelValue[props.rowKey] === 0 ? 'i-lucide-clipboard-plus' : 'i-lucide-clipboard-pen-line')

const { submitting, startSubmitting, endSubmitting } = useSubmitting()
async function onSubmitWithValidation(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  try {
    await form.value?.validate?.()
  } catch {
    // Validation failed, do not proceed
    return
  }
  try {
    startSubmitting()
    await props.onSubmit()
  } finally {
    endSubmitting()
  }
}
</script>

<template>
  <UModal
    :title="titleWithAction"
    :description="descWithAction"
    :close="{ onClick: () => props.onClose(false) }"
    :dismissible="false"
    :fullscreen="fullscreen"
  >
    <template #body>
      <ProForm
        ref="form"
        :fields="fields"
        :loading="submitting"
        :model-value="modelValue"
        @trigger-submit="onSubmitWithValidation"
        @update-model-value="onUpdateModelValue"
      />
    </template>
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        icon="i-lucide-x"
        @click="props.onClose(false)"
      />
      <UButton
        :label="action"
        color="primary"
        variant="solid"
        :icon="submitIcon"
        :loading="submitting"
        @click="onSubmitWithValidation"
      />
    </template>
  </UModal>
</template>
