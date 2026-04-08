<script setup lang="ts">
import type { VFormFieldProps, Table, TableColumn } from '#v/types'
import * as z from 'zod'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useFormSubmission, useFormValues, useTableApi, useTableColumnApi } from '#v/composables'
import { computed, ref, toRef } from 'vue'

const props = defineProps<{
  model: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Table]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0 })

const tableColumnApi = useTableColumnApi()

const columns = ref<Partial<TableColumn>[]>([])

function addColumn() {
  const maxOrder = columns.value.reduce((max, col) => Math.max(max, col.order ?? 0), 0)
  columns.value.push({
    columnKey: '',
    label: '',
    order: maxOrder + 1,
    width: 100,
    fixed: '',
    visible: true
  })
}

function removeColumn(index: number) {
  columns.value.splice(index, 1)
}

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  async (model) => {
    const tableApi = useTableApi()
    if (model.id === 0) {
      const { data } = await tableApi.create(model)
      const newTable = data.value?.data
      if (newTable && columns.value.length > 0) {
        for (const col of columns.value) {
          await tableColumnApi.create({
            ...col,
            tableId: newTable.id
          } as TableColumn)
        }
      }
      emit('save', newTable as Table)
    } else {
      emit('save', model)
    }
  },
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
  >
    <template #after-form>
      <div class="border-t pt-4 mt-4">
        <div class="font-semibold mb-2">初始列配置</div>
        <div class="text-sm text-dimmed mb-4">创建 Table 时可以同时添加列配置</div>
        
        <div class="flex flex-col gap-2">
          <div
            v-for="(col, idx) in columns"
            :key="idx"
            class="flex items-center gap-2 p-2 border rounded"
          >
            <UInput
              v-model="col.columnKey"
              placeholder="列标识"
              class="w-32"
            />
            <UInput
              v-model="col.label"
              placeholder="显示名"
              class="w-32"
            />
            <UInputNumber
              v-model="col.order"
              :min="0"
              placeholder="顺序"
              class="w-20"
            />
            <UInputNumber
              v-model="col.width"
              :min="0"
              placeholder="宽度"
              class="w-24"
            />
            <USelect
              v-model="col.fixed"
              :items="[
                { label: '不固定', value: '' },
                { label: '左侧', value: 'left' },
                { label: '右侧', value: 'right' }
              ]"
              placeholder="固定"
              class="w-28"
            />
            <USwitch v-model="col.visible" />
            <span class="text-sm">{{ col.visible ? '显示' : '隐藏' }}</span>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="removeColumn(idx)"
            />
          </div>
        </div>
        
        <UButton
          label="添加列"
          icon="i-lucide-plus"
          variant="soft"
          class="mt-2"
          @click="addColumn"
        />
      </div>
    </template>
  </FormCreateModalTemplate>
</template>
