<script setup lang="ts" generic="T">
import { markRaw } from 'vue'
import { defu } from 'defu'
import { useOverlay } from '@nuxt/ui/composables'
import type { TableHeaderProps, VColumn } from '#v/types'
import type { ButtonProps } from '@nuxt/ui'
import UButton from '@nuxt/ui/components/Button.vue'
import UChip from '@nuxt/ui/components/Chip.vue'
import UKbd from '@nuxt/ui/components/Kbd.vue'
import PermissionWrapper from '#v/components/PermissionWrapper.vue'
import TableQueryOrder from '#v/components/table/query/order/index.vue'
import DeleteModal from '#v/components/DeleteModal.vue'
import TableHeaderSettings from '#v/components/table/header/settings/index.vue'
import TableExcelExportModal from '#v/components/table/ExcelExportModal.vue'

const props = withDefaults(defineProps<TableHeaderProps<T>>(), {
  size: 'md',
  oprOrder: () => ['create', 'refresh', 'whereQuery', 'orderQuery', 'settings', 'exportExcel', 'batchDelete']
})

const defaultNewRow = { id: 0 } as Record<string, any> as T

const overlay = useOverlay()
const deleteModal = markRaw(overlay.create(DeleteModal))
const settingsModal = markRaw(overlay.create(TableHeaderSettings))
const excelExportModal = markRaw(overlay.create(TableExcelExportModal))

function omitOnClick(button: ButtonProps): Omit<ButtonProps, 'onClick'> {
  const { onClick: _, ...rest } = button
  return rest
}

async function handleCreate() {
  const result = await props.onEditRowFromModal?.(props.onNew?.() ?? defaultNewRow)
  if (result) {
    props.fetchList()
  }
}

async function handleSettings() {
  if (!props.onUpdateBizColumns) return
  const updateFn = props.onUpdateBizColumns
  await settingsModal.open({
    tblName: props.name,
    rawBizColumns: props.rawBizColumns as any,
    onUpdateBizColumns: ((cols: VColumn<T>[]) => updateFn(cols)) as any
  })
}

async function handleExportExcel() {
  await excelExportModal.open({
    columns: props.rawBizColumns as any,
    filename: props.exportExcel!.filename,
    filenameWithDateTime: props.exportExcel!.filenameWithDateTime,
    listFn: props.apiGroup?.().countAndList,
    whereQueryOptions: props.whereQueryProps.whereOptions as any,
    extraWhereQueryInitValues: defu(props.extraWhereQueryInitValues, props.exportExcel!.extraWhereQueryInitValues)
  })
}

async function handleBatchDelete() {
  const result = await deleteModal.open({
    ids: props.selectedIds!,
    onDelete: (ids: number[]) => props.apiGroup?.().batchDelete({ ids })
  }).result
  if (result) {
    await props.fetchList()
  }
}

async function onLeftExtraButtonClick(btn: NonNullable<typeof props.extraButtons>[number], e: MouseEvent) {
  if (btn.withBatchData && props.selectedIds && btn.batchFn) {
    await btn.batchFn(props.selectedIds)
    await props.fetchList()
  }
  const originalOnClick = btn.button.onClick
  if (Array.isArray(originalOnClick)) {
    originalOnClick.forEach(fn => fn?.(e))
  } else {
    originalOnClick?.(e)
  }
}

async function onRightExtraButtonClick(btn: NonNullable<typeof props.extraButtons>[number], e: MouseEvent) {
  if (btn.withBatchData && props.selectedIds && btn.batchFn) {
    await btn.batchFn(props.selectedIds)
  }
  const originalOnClick = btn.button.onClick
  if (Array.isArray(originalOnClick)) {
    originalOnClick.forEach(fn => fn?.(e))
  } else {
    originalOnClick?.(e)
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <template v-for="(btn, i) in extraButtons" :key="`extra-left-${i}`">
      <UButton
        v-if="(!btn.withBatchData || selectedIds?.length) && btn.appendTo === 'left'"
        v-bind="omitOnClick(btn.button)"
        @click="(e: MouseEvent) => onLeftExtraButtonClick(btn, e)"
      />
    </template>

    <template v-for="opr in oprOrder" :key="opr">
      <UButton
        v-if="opr === 'create' && !disableCreation"
        icon="i-lucide-plus"
        :size="size"
        @click="handleCreate"
      >
        新增
      </UButton>

      <UButton
        v-if="opr === 'refresh'"
        icon="i-lucide-refresh-ccw"
        :size="size"
        color="neutral"
        :loading="fetching"
        variant="outline"
        @click="fetchList"
      >
        刷新
      </UButton>

      <UChip
        v-if="opr === 'whereQuery' && !disableWhereQuery"
        :show="!whereQueryProps.isWhereQueryValueEmpty"
      >
        <UButton
          icon="i-lucide-list-filter"
          :size="size"
          :color="whereQueryProps.whereQueryOpen ? 'primary' : 'neutral'"
          :loading="fetching"
          variant="outline"
          @click="whereQueryProps.onUpdateWhereQueryOpen?.(!whereQueryProps.whereQueryOpen)"
        >
          查询
        </UButton>
      </UChip>

      <TableQueryOrder
        v-if="opr === 'orderQuery' && !disableOrderQuery"
        v-bind="orderQueryProps"
        :size="size"
      />

      <UButton
        v-if="opr === 'settings' && !disableSettings && rawBizColumns?.length && onUpdateBizColumns"
        icon="i-lucide-settings"
        :size="size"
        color="neutral"
        variant="outline"
        @click="handleSettings"
      >
        设置
      </UButton>

      <template v-if="opr === 'exportExcel' && exportExcel">
        <PermissionWrapper v-if="exportExcel.permissionKey" :permission="exportExcel.permissionKey">
          <UButton
            icon="i-lucide-sheet"
            :size="size"
            color="neutral"
            variant="outline"
            @click="handleExportExcel"
          >
            导出
          </UButton>
        </PermissionWrapper>
        <UButton
          v-else
          icon="i-lucide-sheet"
          :size="size"
          color="neutral"
          variant="outline"
          @click="handleExportExcel"
        >
          导出
        </UButton>
      </template>

      <UButton
        v-if="opr === 'batchDelete' && !disableBatchDeletion && selectedIds?.length"
        icon="i-lucide-trash-2"
        :size="size"
        color="error"
        variant="outline"
        @click="handleBatchDelete"
      >
        批量删除
        <template #trailing>
          <UKbd size="sm">{{ selectedIds?.length ?? 0 }}</UKbd>
        </template>
      </UButton>
    </template>

    <template v-for="(btn, i) in extraButtons" :key="`extra-right-${i}`">
      <UButton
        v-if="(!btn.withBatchData || selectedIds?.length) && btn.appendTo === 'right'"
        v-bind="omitOnClick(btn.button)"
        @click="(e: MouseEvent) => onRightExtraButtonClick(btn, e)"
      />
    </template>
  </div>
</template>
