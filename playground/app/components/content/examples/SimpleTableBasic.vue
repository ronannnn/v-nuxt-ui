<script setup lang="ts">
import type { VColumn, RowActionProps } from '#build/types/v-nuxt-ui'

interface SimpleUser {
  id: number
  name: string
  status: string
  role: string
}

const toast = useToast()

const data = ref<SimpleUser[]>([
  { id: 1, name: 'Alice', status: 'active', role: 'Admin' },
  { id: 2, name: 'Bob', status: 'active', role: 'Editor' },
  { id: 3, name: 'Charlie', status: 'inactive', role: 'Viewer' },
  { id: 4, name: 'Diana', status: 'active', role: 'Editor' },
  { id: 5, name: 'Eve', status: 'inactive', role: 'Viewer' }
])

const columns: VColumn<SimpleUser>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    filterOption: {
      type: 'select',
      items: [
        { label: 'Active', value: 'active', color: 'success' },
        { label: 'Inactive', value: 'inactive', color: 'error' }
      ]
    }
  },
  { accessorKey: 'role', header: 'Role' }
]

const extraRowActions: RowActionProps<SimpleUser>[] = [
  {
    label: '查看详情',
    icon: 'i-lucide-eye',
    fn: (row) => {
      toast.add({ title: '查看', description: `查看 ${row.name} 的详情`, color: 'info' })
    }
  },
  {
    label: '更多',
    icon: 'i-lucide-ellipsis',
    children: [
      {
        label: '编辑',
        icon: 'i-lucide-pen-line',
        fn: (row) => {
          toast.add({ title: '编辑', description: `编辑 ${row.name}`, color: 'primary' })
        }
      },
      {
        label: '删除',
        icon: 'i-lucide-trash-2',
        color: 'error',
        fn: (row) => {
          toast.add({ title: '删除', description: `删除 ${row.name}`, color: 'error' })
        }
      }
    ]
  }
]
</script>

<template>
  <ProSimpleTable
    :data="data"
    :biz-columns="columns"
    :extra-row-actions="extraRowActions"
    hide-last-row-border
    class="border border-default rounded-md"
  />
</template>
