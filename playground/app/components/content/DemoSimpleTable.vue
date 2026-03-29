<script setup lang="ts">
import type { VColumn } from '#build/types/v-nuxt-ui'

const data = ref([
  { id: 1, name: 'Alice', status: 'active', role: 'Admin' },
  { id: 2, name: 'Bob', status: 'active', role: 'Editor' },
  { id: 3, name: 'Charlie', status: 'inactive', role: 'Viewer' },
  { id: 4, name: 'Diana', status: 'active', role: 'Editor' },
  { id: 5, name: 'Eve', status: 'inactive', role: 'Viewer' }
])

const columns: VColumn<any>[] = [
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
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <p class="text-sm text-muted">
      A lightweight read-only table. Columns with select-type filterOption automatically render as badges.
    </p>

    <ProSimpleTable :data="data" :biz-columns="columns" />
  </div>
</template>
