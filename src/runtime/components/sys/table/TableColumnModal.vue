<script setup lang="ts">
import * as z from 'zod'
import type { VFormFieldProps, TableColumn } from '#v/types'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useFormValues } from '#v/composables'
import { computed, toRef } from 'vue'

const props = defineProps<{
  column: TableColumn
  onSaveColumn: (col: TableColumn) => void
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const { newValues } = useFormValues(toRef(props.column), { id: 0 })

const fixedItems = [
  { label: '不固定', value: '' },
  { label: '左侧固定', value: 'left' },
  { label: '右侧固定', value: 'right' }
]

const fields = computed<VFormFieldProps[]>(() => [
  { name: 'columnKey', type: 'input', label: '列标识', colSpan: '12', zodType: z.string().min(1, '列标识不能为空') },
  { name: 'label', type: 'input', label: '显示名', colSpan: '12', zodType: z.string().min(1, '显示名不能为空') },
  { name: 'order', type: 'input-number', label: '顺序', colSpan: '8', zodType: z.number() },
  { name: 'width', type: 'input-number', label: '宽度', colSpan: '8', zodType: z.number() },
  { name: 'fixed', type: 'select', label: '固定', colSpan: '8', items: fixedItems, enableEmptyOption: false, zodType: z.string().optional() },
  { name: 'visible', type: 'switch', label: '是否显示', colSpan: '24', zodType: z.boolean().optional() }
])
</script>

<template>
  <FormCreateModalTemplate
    title="列配置"
    :on-close="ok => emit('close', ok)"
    :fields="fields"
    :model-value="newValues"
    @update-model-value="newVal => newValues = { id: 0, ...newVal }"
    @submit="async () => {
      props.onSaveColumn(newValues as TableColumn)
      emit('close', true)
    }"
  />
</template>
