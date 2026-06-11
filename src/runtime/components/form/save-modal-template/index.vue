<script setup lang="ts" generic="T extends BaseModel">
import { computed, ref, useTemplateRef } from 'vue'
import { useOverlay } from '@nuxt/ui/composables'
import { useSubmitting } from '#v/composables'
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

function computeDiff(): ConfirmDiffItem[] {
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
      fieldName: name,
      oldValue: oldVal,
      newValue: newVal
    })
  }
  return items
}

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

  startSubmitting()

  // 区分两种结束
  // 提交失败 / 校验失败 / 用户取消确认
  // modal 还留在页面上，所以必须 endSubmitting()，让按钮恢复。

  // 提交成功，并且即将关闭 modal
  // modal 还没立刻卸载，中间有一小段时间。如果这时候执行 endSubmitting()，按钮会从 loading 恢复成可点击，用户就能在关闭动画/卸载前再点一次。

  // keepSubmitting 的作用就是标记第 2 种情况：
  let keepSubmitting = false

  try {
    // Update mode: show confirmation modal with diff
    if (isUpdate.value) {
      const items = computeDiff()
      if (items.length > 0) {
        const confirmed = await confirmModal.open({
          fields: props.fields,
          diffItems: items,
          oldModelValue: props.oldModelValue as Record<string, unknown>,
          newModelValue: props.modelValue as Record<string, unknown>
        }).result
        if (!confirmed) {
          return
        }
      }
    }

    keepSubmitting = await props.onSubmit() === true
    if (keepSubmitting) {
      props.onClose(true)
    }
  } finally {
    if (!keepSubmitting) {
      endSubmitting()
    }
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
