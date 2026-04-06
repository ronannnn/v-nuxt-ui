<script setup lang="ts">
import { useOverlay } from '@nuxt/ui/composables'
import { useDepartmentApi } from '#v/composables'
import SysDepartmentsCreateModal from './CreateModal.vue'
import { getOprColumns } from '#v/constants'
import TablePage from '#v/components/table/Page.vue'
import type { Department, VColumn } from '#v/types'

const overlay = useOverlay()
const createModal = overlay.create(SysDepartmentsCreateModal)

const columns: VColumn<Department>[] = [
  {
    accessorKey: 'name',
    header: '部门名称',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'companyId',
    header: '隶属公司',
    sortOption: true,
    cell: ({ row }) => row.original.company?.nickname
  },
  {
    accessorKey: 'parentId',
    header: '上级部门',
    sortOption: true,
    cell: ({ row }) => row.original.parent?.name ?? '无'
  },
  {
    accessorKey: 'leaderId',
    header: '直管领导',
    sortOption: true,
    cell: ({ row }) => row.original.leader?.nickname
  },
  ...getOprColumns()
]
</script>

<template>
  <TablePage
    name="sys-department"
    cn-name="部门信息"
    :use-api-group="useDepartmentApi"
    :biz-columns="columns"
    fetch-all
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    treeify-col-name="parentId"
    :extra-row-actions="[{
      icon: 'i-lucide-clipboard-plus',
      label: '以此作为父部门复制',
      asyncFn: async raw => {
        await createModal.open({ model: useDepartmentApi().copyAsParent?.(raw) ?? { id: 0 } })
      }
    }]"
    @edit-row-from-modal="async (row: Department) => await createModal.open({ model: row }).result"
  />
</template>
