<script setup lang="ts">
import type { VFormFieldProps, Table } from '#v/types'
import * as z from 'zod'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import TableColumnList from './TableColumnList.vue'
import { useFormSubmission, useFormValues, useTableApi } from '#v/composables'
import { computed, ref, toRef } from 'vue'

const props = defineProps<{
  model: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Table]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0 })

const columnListRef = ref<InstanceType<typeof TableColumnList>>()

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  async (model) => {
    const tableApi = useTableApi()
    if (model.id === 0) {
      const { data } = await tableApi.create(model)
      const newTable = data.value?.data
      if (newTable && columnListRef.value?.columns.length) {
        await columnListRef.value.createAllColumns(newTable.id)
      }
      emit('save', newTable as Table)
    } else {
      await columnListRef.value?.saveDirtyColumns(props.model.id)
      emit('save', model)
    }
  },
  useTableApi
)

const fields = computed<VFormFieldProps[]>(() => [
  { name: 'tblName', type: 'input', label: '表名', colSpan: '12', zodType: z.string().min(1, '表名不能为空') },
  { name: 'label', type: 'input', label: '显示名', colSpan: '12', zodType: z.string().min(1, '显示名不能为空') }
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
  >
    <template #after-form>
      <TableColumnList ref="columnListRef" :initial-columns="model.columns" />
    </template>
  </FormCreateModalTemplate>
</template>
