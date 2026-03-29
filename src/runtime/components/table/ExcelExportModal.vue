<script setup lang="ts" generic="T">
import type { ListApi, VColumn, WhereQuery, WhereQueryOption } from '../../types'
import { ref } from 'vue'
import { now } from '@internationalized/date'
import { defu } from 'defu'
import { useExporting } from '#v/composables/useBoolean'
import { useDate } from '#v/composables/useDate'
import { dateFormat, TIME_ZONE } from '#v/constants/time'
import { genTableExcel } from '#v/utils/excel'

const props = defineProps<{
  filename?: string
  filenameWithDateTime?: boolean
  columns: VColumn<any>[]
  whereQueryOptions: WhereQueryOption<any>[]
  extraWhereQueryInitValues?: WhereQuery<any>
  listFn?: ListApi<any>
}>()

const whereQuery = ref<WhereQuery<any>>()

const emit = defineEmits<{
  close: [boolean]
}>()

const { exporting, startExporting, endExporting } = useExporting()
const exportExcel = async () => {
  if (!props.listFn) {
    throw new Error('listFn is required for exporting Excel')
  }
  try {
    startExporting()
    const { data } = await props.listFn({
      pagination: {
        pageNum: 0,
        pageSize: 0
      },
      whereQuery: defu(whereQuery.value, props.extraWhereQueryInitValues)
    })
    if (data.value.data) {
      const filename = props.filenameWithDateTime
        ? `${props.filename || '导出数据'}-${useDate().dateValueToDayjs(now(TIME_ZONE))?.format(dateFormat)}`
        : `${props.filename || '导出数据'}`
      await genTableExcel(props.columns, data.value.data.list, filename)
      emit('close', true)
    }
  } finally {
    endExporting()
  }
}
</script>

<template>
  <UModal
    title="导出Excel文件"
    description="根据当前表格列导出Excel文件"
    :close="{ onClick: () => emit('close', false) }"
    :dismissible="false"
  >
    <template #body>
      <UFormField label="筛选条件">
        <ProTableQueryWhere
          :where-query="whereQuery"
          :where-options="whereQueryOptions"
          :trigger-fetching="async () => {}"
          hide-query-button
          @update-where-query="newWhereQuery => whereQuery = newWhereQuery"
        />
      </UFormField>
    </template>
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        icon="i-lucide-x"
        @click="emit('close', false)"
      />
      <UButton
        label="导出"
        color="primary"
        variant="solid"
        icon="i-lucide-sheet"
        :loading="exporting"
        @click="exportExcel"
      />
    </template>
  </UModal>
</template>
