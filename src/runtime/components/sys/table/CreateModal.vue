<script setup lang="ts">
import type { VFormFieldProps, Table } from '#v/types'
import * as z from 'zod'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useFormSubmission, useFormValues, useTableApi } from '#v/composables'
import { computed, toRef } from 'vue'

const props = defineProps<{
  model: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Table]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0 })

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  model => emit('save', model),
  useTableApi
)

const fields = computed<VFormFieldProps[]>(() => [
  { name: 'tblName', type: 'input', label: '表名', colSpan: '12', zodType: z.string().min(1, '表名不能为空') },
  { name: 'label', type: 'input', label: '显示名', colSpan: '12', zodType: z.string().min(1, '显示名不能为空') },
  { name: 'labelI18nKey', type: 'input', label: 'i18n Key', colSpan: '24', zodType: z.string().optional().nullable() }
])

function updateModelValue(newVal: Partial<Table>) {
  newValues.value = { id: 0, ...newVal }
}
</script>

<template>
  <FormCreateModalTemplate
    title="Table"
    :on-close="ok => emit('close', ok)"
    :fields="fields"
    :model-value="newValues"
    @update-model-value="updateModelValue"
    @submit="onSubmit"
  />
</template>
