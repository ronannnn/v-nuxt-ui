<script setup lang="ts">
const showDeleteModal = ref(false)

const components = [
  {
    name: 'ProDeleteModal',
    description: 'Generic delete confirmation modal with batch delete support.',
    icon: 'i-lucide-trash-2'
  },
  {
    name: 'ProPermissionWrapper',
    description: 'Permission-based UI wrapper. Supports hide/disable modes via provide/inject.',
    icon: 'i-lucide-shield'
  },
  {
    name: 'ProDatePicker',
    description: 'Enhanced date picker with shortcut presets and range support.',
    icon: 'i-lucide-calendar'
  },
  {
    name: 'ProDnd',
    description: 'Drag-and-drop list component powered by vue-draggable-plus.',
    icon: 'i-lucide-grip-vertical'
  },
  {
    name: 'ProButtonDropdown',
    description: 'Dropdown button with selectable options.',
    icon: 'i-lucide-chevron-down'
  },
  {
    name: 'ProSimpleTable',
    description: 'Lightweight table for displaying static data without CRUD.',
    icon: 'i-lucide-table'
  },
  {
    name: 'ProFlowNode',
    description: 'Flow chart node with 16 connection handles for @vue-flow/core.',
    icon: 'i-lucide-workflow'
  }
]

const composables = [
  { name: 'useApi', description: 'Factory for creating standard CRUD API composables.' },
  { name: 'useModel', description: 'Model utilities for API operations.' },
  { name: 'useBoolean', description: 'Boolean state helpers (useLoading, useSubmitting, etc.).' },
  { name: 'useForm', description: 'Form state management with Zod validation.' },
  { name: 'useDate', description: 'Date formatting and manipulation utilities.' },
  { name: 'useEChart', description: 'ECharts integration composable.' },
  { name: 'useApp', description: 'App-level state and configuration.' },
  { name: 'useTheme', description: 'Theme management (dark mode, colors, etc.).' },
  { name: 'useTablePagination', description: 'Pagination state and logic.' },
  { name: 'useTableColumns', description: 'Column management with visibility toggling.' },
  { name: 'useTableRowActions', description: 'Row-level CRUD actions (edit, copy, delete).' },
  { name: 'useTableWhereQuery', description: 'Where query filter management.' },
  { name: 'useTableOrderQuery', description: 'Order/sort query management.' }
]
</script>

<template>
  <div class="max-w-5xl">
    <h1 class="text-2xl font-bold mb-2">Components & Composables</h1>
    <p class="text-muted mb-6">
      Overview of all reusable components and composables included in the library.
    </p>

    <h2 class="text-xl font-semibold mb-4">Components</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <UCard v-for="comp in components" :key="comp.name">
        <div class="flex items-start gap-3">
          <UIcon :name="comp.icon" class="text-primary size-5 mt-0.5 shrink-0" />
          <div>
            <h3 class="font-semibold text-sm">{{ comp.name }}</h3>
            <p class="text-xs text-muted mt-1">{{ comp.description }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <h2 class="text-xl font-semibold mb-4">Composables</h2>
    <UCard>
      <div class="divide-y divide-default">
        <div v-for="comp in composables" :key="comp.name" class="py-3 first:pt-0 last:pb-0">
          <div class="flex items-center gap-2">
            <code class="text-primary text-sm font-medium">{{ comp.name }}</code>
          </div>
          <p class="text-xs text-muted mt-1">{{ comp.description }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
