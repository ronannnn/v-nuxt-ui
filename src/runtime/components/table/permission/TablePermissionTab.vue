<script setup lang="ts">
import { useOverlay } from '@nuxt/ui/composables'
import type { TablePermission } from '#v/types'
import TablePermissionConfig from './TablePermissionConfig.vue'

const props = defineProps<{
  modelValue: TablePermission[]
}>()

const emit = defineEmits<{
  'update:modelValue': [TablePermission[]]
}>()

const overlay = useOverlay()
const tablePermissionConfigModal = overlay.create(TablePermissionConfig)

function openAddModal() {
  tablePermissionConfigModal.open({}).result.then((result: any) => {
    if (result && typeof result === 'object' && 'save' in result) {
      const newPermissions = [...props.modelValue, result.save]
      emit('update:modelValue', newPermissions)
    }
  })
}

function openEditModal(permission: TablePermission) {
  tablePermissionConfigModal.open({ permission }).result.then((result: any) => {
    if (result && typeof result === 'object' && 'save' in result) {
      const newPermissions = props.modelValue.map(p =>
        p.tableId === result.save.tableId ? result.save : p
      )
      emit('update:modelValue', newPermissions)
    }
  })
}

function removePermission(tableId: number) {
  const newPermissions = props.modelValue.filter(p => p.tableId !== tableId)
  emit('update:modelValue', newPermissions)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-end">
      <UButton
        label="添加 Table 权限"
        icon="i-lucide-plus"
        size="sm"
        @click="openAddModal"
      />
    </div>

    <UTable
      v-if="props.modelValue.length > 0"
      :data="props.modelValue"
      :columns="[
        { accessorKey: 'name', header: 'Table 名称' },
        { accessorKey: 'tableId', header: 'Table ID' },
        { accessorKey: 'canView', header: 'CanView', cell: ({ row }) => row.original.canView ? '是' : '否' },
        { accessorKey: 'canEdit', header: 'CanEdit', cell: ({ row }) => row.original.canEdit ? '是' : '否' },
        { accessorKey: 'columnPermissions', header: '列权限数', cell: ({ row }) => row.original.columnPermissions?.length || 0 },
        { accessorKey: 'actions', header: '操作', cell: ({ row }) => 'actions' }
      ]"
    >
      <template #body-cell-actions="{ row }">
        <div class="flex gap-1">
          <UButton
            icon="i-lucide-edit"
            variant="ghost"
            size="xs"
            @click="openEditModal(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            variant="ghost"
            size="xs"
            color="error"
            @click="removePermission(row.original.tableId)"
          />
        </div>
      </template>
    </UTable>

    <div v-else class="text-center text-dimmed text-sm py-8">
      暂无 Table 权限配置
    </div>
  </div>
</template>
