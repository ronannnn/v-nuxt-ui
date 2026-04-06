<script setup lang="ts">
import { useOverlay } from '@nuxt/ui/composables'
import { useJobTitleApi } from '#v/composables'
import SysJobTitlesCreateModal from './CreateModal.vue'
import { getOprColumns, booleanOptions } from '#v/constants'
import UBadge from '@nuxt/ui/components/Badge.vue'
import { h } from 'vue'
import TablePage from '#v/components/table/Page.vue'
import type { VColumn, JobTitle } from '#v/types'

const overlay = useOverlay()
const createModal = overlay.create(SysJobTitlesCreateModal)

const columns: VColumn<JobTitle>[] = [
  {
    accessorKey: 'name',
    header: '职位名称',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'description',
    header: '描述',
    sortOption: true,
    filterOption: {
      type: 'input'
    }
  },
  {
    accessorKey: 'disabled',
    header: '禁用',
    cell: ({ cell }) => h(
      UBadge,
      {
        modelValue: cell.getValue(),
        label: cell.getValue() ? '是' : '否',
        variant: 'soft',
        color: cell.getValue() ? 'error' : 'neutral'
      }
    ),
    sortOption: true,
    filterOption: {
      type: 'select',
      items: booleanOptions
    }
  },
  {
    accessorKey: 'remark',
    header: '备注',
    sortOption: true
  },
  ...getOprColumns()
]
</script>

<template>
  <TablePage
    name="sys-job-title"
    cn-name="职位信息"
    :use-api-group="useJobTitleApi"
    :biz-columns="columns"
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    @edit-row-from-modal="async (row: JobTitle) => await createModal.open({ model: row }).result"
  />
</template>
