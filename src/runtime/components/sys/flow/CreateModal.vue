<script setup lang="ts">
import * as z from 'zod'
import type { Flow } from '#v/types'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useFlowApi, useFormSubmission, useFormValues } from '#v/composables'
import { toRef } from 'vue'

const props = defineProps<{
  model: Flow
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Flow]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0 })

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  model => emit('save', model),
  useFlowApi
)
</script>

<template>
  <FormCreateModalTemplate
    title="流程信息"
    :on-close="ok => emit('close', ok)"
    :fields="[
      { name: 'name', type: 'input', label: '流程名称', colSpan: '24', zodType: z.string().min(2, '名称字数不足') },
      { name: 'description', type: 'textarea', label: '流程描述', colSpan: '24' }
    ]"
    :model-value="newValues"
    @update-model-value="newVal => newValues = { ...newValues, ...newVal }"
    @submit="onSubmit"
  />
</template>
