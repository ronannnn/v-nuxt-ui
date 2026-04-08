<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTableApi, useTableColumnApi } from '#v/composables/api'
import { useToast } from '@nuxt/ui/composables'
import type { Table, TablePermission, TableColumnPermission, MergedTableColumn } from '#v/types'

const props = defineProps<{
  permission?: TablePermission
  tableId?: number
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [TablePermission]
}>()

const tableApi = useTableApi()
const tableColumnApi = useTableColumnApi()

const tables = ref<Table[]>([])
const selectedTableId = ref<number | undefined>(props.tableId)
const selectedTable = ref<Table | undefined>()
const mergedColumns = ref<MergedTableColumn[]>([])

const canView = ref(false)
const canEdit = ref(false)
const columnPermissions = ref<TableColumnPermission[]>([])

const loading = ref(false)
const saving = ref(false)

const tableItems = computed(() => tables.value.map(t => ({
  label: `${t.label} (${t.tblName})`,
  value: t.id
})))

async function fetchTables() {
  loading.value = true
  const { data } = await tableApi.list({
    pagination: { pageNum: 0, pageSize: 0 },
    orderQuery: [{ field: 'label', order: 'asc' }]
  })
  if (data.value.data) {
    tables.value = data.value.data.list
  }
  loading.value = false
}

async function fetchMergedColumns(tblName: string) {
  const { data } = await tableColumnApi.getMergedColumns(tblName)
  if (data.value.data) {
    mergedColumns.value = data.value.data
    initColumnPermissions()
  }
}

function initColumnPermissions() {
  columnPermissions.value = mergedColumns.value.map((col) => {
    const existing = props.permission?.columnPermissions?.find(
      cp => cp.columnKey === col.columnKey
    )
    return {
      id: existing?.id ?? 0,
      tablePermissionId: props.permission?.id ?? 0,
      columnKey: col.columnKey,
      canView: existing?.canView ?? col.canView,
      canEdit: existing?.canEdit ?? col.canEdit
    }
  })
}

function onTableChange(tableId: number) {
  selectedTableId.value = tableId
  const table = tables.value.find(t => t.id === tableId)
  if (table) {
    selectedTable.value = table
    fetchMergedColumns(table.tblName)
  }
}

function handleSave() {
  if (!selectedTableId.value || !selectedTable.value) {
    useToast().add({
      title: '请选择 Table',
      color: 'warning'
    })
    return
  }

  saving.value = true

  const result: TablePermission = {
    id: props.permission?.id ?? 0,
    name: selectedTable.value.label,
    tableId: selectedTableId.value,
    canView: canView.value,
    canEdit: canEdit.value,
    columnPermissions: columnPermissions.value
  }

  emit('save', result)
  emit('close', true)
  saving.value = false
}

function handleClose() {
  emit('close', false)
}

onMounted(async () => {
  await fetchTables()

  if (props.tableId) {
    selectedTableId.value = props.tableId
    const table = tables.value.find(t => t.id === props.tableId)
    if (table) {
      selectedTable.value = table
      await fetchMergedColumns(table.tblName)
    }
  }

  if (props.permission) {
    canView.value = props.permission.canView ?? false
    canEdit.value = props.permission.canEdit ?? false
  }
})
</script>

<template>
  <UModal
    :title="props.permission ? '编辑 Table 权限' : '配置 Table 权限'"
    size="xl"
    :close="{ onClick: handleClose }"
  >
    <div class="p-4 space-y-4">
      <UFormField label="选择 Table" required>
        <USelect
          v-model="selectedTableId"
          :items="tableItems"
          :loading="loading"
          placeholder="请选择 Table"
          class="w-full"
          @update:model-value="onTableChange"
        />
      </UFormField>

      <div v-if="selectedTable" class="space-y-4">
        <div class="text-sm font-medium">
          表级权限
        </div>
        <div class="flex gap-6">
          <UCheckbox
            v-model="canView"
            label="CanView"
          />
          <UCheckbox
            v-model="canEdit"
            label="CanEdit"
          />
        </div>

        <div class="text-sm font-medium">
          列级权限
        </div>
        <UTable :data="columnPermissions" class="max-h-80">
          <UTableColumn accessor-key="columnKey" header="列标识">
            <template #cell="{ row }">
              <span class="text-sm">
                {{ mergedColumns.find(c => c.columnKey === row.original.columnKey)?.label || row.original.columnKey }}
              </span>
            </template>
          </UTableColumn>
          <UTableColumn accessor-key="columnKey" header="列名">
            <template #cell="{ row }">
              <span class="text-dimmed text-xs">
                {{ row.original.columnKey }}
              </span>
            </template>
          </UTableColumn>
          <UTableColumn accessor-key="canView" header="CanView">
            <template #cell="{ row }">
              <USwitch v-model="row.original.canView" />
            </template>
          </UTableColumn>
          <UTableColumn accessor-key="canEdit" header="CanEdit">
            <template #cell="{ row }">
              <USwitch v-model="row.original.canEdit" />
            </template>
          </UTableColumn>
        </UTable>
      </div>
    </div>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        @click="handleClose"
      />
      <UButton
        label="保存"
        color="primary"
        variant="solid"
        :loading="saving"
        :disabled="!selectedTableId"
        @click="handleSave"
      />
    </template>
  </UModal>
</template>
