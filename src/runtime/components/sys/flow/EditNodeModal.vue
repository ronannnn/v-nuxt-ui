<script setup lang="ts">
import * as z from 'zod'
import type { FlowNode } from '#v/types'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useFormValues } from '#v/composables'
import { toRef } from 'vue'

const props = defineProps<{
  model: FlowNode
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [FlowNode]
}>()

const { newValues } = useFormValues(toRef(props.model), {
  id: 0,
  name: ''
})
</script>

<template>
  <FormCreateModalTemplate
    title="编辑节点"
    :on-close="ok => emit('close', ok)"
    :fields="[
      { name: 'name', type: 'input', label: '节点名称', colSpan: '24', zodType: z.string().min(1, '请输入节点名称') }
    ]"
    :model-value="newValues"
    @update-model-value="newVal => newValues = { ...props.model, ...newVal }"
    @submit="async () => {
      emit('save', newValues)
      emit('close', true)
    }"
  />
</template>
