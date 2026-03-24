<script setup lang="ts">
// Demo data for the table
interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

const demoData = ref<User[]>([
  { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'active', createdAt: '2025-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'active', createdAt: '2025-02-20' },
  { id: 3, name: 'Charlie Wang', email: 'charlie@example.com', role: 'Editor', status: 'inactive', createdAt: '2025-03-10' },
  { id: 4, name: 'Diana Lee', email: 'diana@example.com', role: 'User', status: 'active', createdAt: '2025-04-05' },
  { id: 5, name: 'Ethan Zhang', email: 'ethan@example.com', role: 'Admin', status: 'active', createdAt: '2025-05-12' }
])

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'createdAt', header: 'Created At' }
]
</script>

<template>
  <div class="max-w-6xl">
    <h1 class="text-2xl font-bold mb-2">ProTable Demo</h1>
    <p class="text-muted mb-6">
      The ProTable component provides a sophisticated data table with CRUD operations,
      pagination, column management, query filters, row selection, and Excel export.
    </p>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Basic Table</h3>
      </template>

      <p class="text-sm text-muted mb-4">
        Below is a basic NuxtUI table demonstrating the column definitions used by ProTable.
        In a real application, you would use <code>ProTable</code> with a backend API via <code>useApiGroup</code>.
      </p>

      <UTable :data="demoData" :columns="columns" />
    </UCard>

    <UCard class="mt-6">
      <template #header>
        <h3 class="font-semibold">ProTable Usage</h3>
      </template>
      <pre class="text-sm overflow-x-auto"><code>&lt;ProTable
  name="users"
  cn-name="Users"
  :biz-columns="bizColumns"
  :use-api-group="useUserApi"
  :on-edit-row-from-modal="openEditModal"
  :export-excel="{ filename: 'users' }"
/&gt;</code></pre>
    </UCard>
  </div>
</template>
