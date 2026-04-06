<script setup lang="ts">
import { getOprColumns } from '#v/constants'
import type { IssueRecord, VColumn } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'
import { useIssueRecordApi } from '#v/composables'
import SysIssueRecordsCreateModal from './CreateModal.vue'
import TablePage from '#v/components/table/Page.vue'

const overlay = useOverlay()
const createModal = overlay.create(SysIssueRecordsCreateModal)

const columns: VColumn<IssueRecord>[] = [
  {
    accessorKey: 'description',
    header: '描述',
    filterOption: {
      type: 'input'
    }
  },
  ...getOprColumns()
]
</script>

<template>
  <TablePage
    name="sys-issue-record"
    cn-name="改进建议"
    :use-api-group="useIssueRecordApi"
    :biz-columns="columns"
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    @edit-row-from-modal="async (row: IssueRecord) => await createModal.open({ model: row }).result"
  />
</template>
