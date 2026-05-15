<script setup lang="ts" generic="T extends BaseModel">
import { computed, ref, useTemplateRef } from 'vue'
import { useOverlay } from '@nuxt/ui/composables'
import { useSubmitting } from '#v/composables/useBoolean'
import type { BaseModel, SaveModalFormTemplateProps } from '#v/types'
import Form from '../index.vue'
import ConfirmUpdateModal from './ConfirmUpdateModal.vue'
import type { ConfirmDiffItem } from './ConfirmUpdateModal.vue'

const props = withDefaults(defineProps<SaveModalFormTemplateProps<T>>(), {
  rowKey: 'id'
})

const form = useTemplateRef('form')

const action = computed(() => props.modelValue[props.rowKey] === 0 ? '创建' : '更新')
const isUpdate = computed(() => props.modelValue[props.rowKey] !== 0)
const titleWithAction = computed(() => `${action.value}${props.title}`)
const descWithAction = computed(() => props.description ?? `请${action.value}${props.title}`)
const submitIcon = computed(() => props.modelValue[props.rowKey] === 0 ? 'i-lucide-clipboard-plus' : 'i-lucide-clipboard-pen-line')

// Capture initial model value for diff comparison on update
const initialModelValue = ref<Partial<T>>(JSON.parse(JSON.stringify(props.modelValue)))

const overlay = useOverlay()
const confirmModal = overlay.create(ConfirmUpdateModal)

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'boolean') return val ? '是' : '否'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function computeDiff() {
  const items: ConfirmDiffItem[] = []
  for (const field of props.fields) {
    if (!field.name || field.hidden) continue
    const name = field.name
    const oldVal = (initialModelValue.value as Record<string, unknown>)[name]
    const newVal = (props.modelValue as Record<string, unknown>)[name]

    // Both empty
    if ((oldVal === null || oldVal === undefined) && (newVal === null || newVal === undefined)) continue
    // Same value
    if (oldVal === newVal) continue
    // Object/array deep compare
    if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
      if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue
    }

    items.push({
      label: field.label || name,
      oldValue: formatValue(oldVal),
      newValue: formatValue(newVal)
    })
  }
  return items
}

const { submitting, startSubmitting, endSubmitting } = useSubmitting()

async function doSubmit() {
  try {
    startSubmitting()
    await props.onSubmit()
  } finally {
    endSubmitting()
  }
}

async function onSubmitWithValidation(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  try {
    await form.value?.validate?.()
  } catch {
    // Validation failed, do not proceed
    return
  }

  // Update mode: show confirmation modal with diff
  if (isUpdate.value) {
    const items = computeDiff()
    if (items.length === 0) {
      await doSubmit()
      return
    }
    const confirmed = await confirmModal.open({ diffItems: items }).result
    if (confirmed) {
      await doSubmit()
    }
    return
  }

  // Create mode: submit directly
  await doSubmit()
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
      <Form
        ref="form"
        :fields="fields"
        :loading="submitting"
        :model-value="modelValue"
        @trigger-submit="onSubmitWithValidation"
        @update-model-value="onUpdateModelValue"
      />
      <slot name="after-form" />
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
