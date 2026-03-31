<script setup lang="ts" generic="T">
import { computed, h } from 'vue'
import { defu } from 'defu'
import { useOverlay } from '@nuxt/ui/composables'
import type { TableHeaderProps } from '#v/types'
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

const overlay = useOverlay()
const deleteModal = overlay.create(DeleteModal)
const settingsModal = overlay.create(TableHeaderSettings)
const excelExportModal = overlay.create(TableExcelExportModal)

const oprButtons = computed(() => {
  const defaultButtons = props.oprOrder.map((opr) => {
    switch (opr) {
      case 'create':
        if (props.disableCreation) return null
        return h(
          UButton,
          {
            icon: 'i-lucide-plus',
            size: props.size,
            onClick: async () => {
              const result = await props.onEditRowFromModal?.(props.onNew?.() ?? { id: 0 } as T)
              if (result) {
                props.fetchList()
              }
            }
          },
          () => '新增'
        )
      case 'refresh':
        return h(
          UButton,
          {
            icon: 'i-lucide-refresh-ccw',
            size: props.size,
            color: 'neutral',
            loading: props.fetching,
            variant: 'outline',
            onClick: () => props.fetchList()
          },
          () => '刷新'
        )
      case 'whereQuery':
        if (props.disableWhereQuery) return null
        return h(
          UChip,
          { show: !props.whereQueryProps.isWhereQueryValueEmpty },
          () => h(
            UButton,
            {
              icon: 'i-lucide-list-filter',
              size: props.size,
              color: props.whereQueryProps.whereQueryOpen ? 'primary' : 'neutral',
              loading: props.fetching,
              variant: 'outline',
              onClick: () => {
                props.whereQueryProps.onUpdateWhereQueryOpen?.(!props.whereQueryProps.whereQueryOpen)
              }
            },
            () => '查询'
          )
        )
      case 'orderQuery':
        if (props.disableOrderQuery) return null
        return h(
            TableQueryOrder<T>,
            { ...props.orderQueryProps, size: props.size }
        )
      case 'settings':
        if (props.disableSettings) return null
        return props.rawBizColumns && props.rawBizColumns.length > 0 && props.onUpdateBizColumns && h(
          UButton,
          {
            icon: 'i-lucide-settings',
            size: props.size,
            color: 'neutral',
            variant: 'outline',
            onClick: async () => {
              await settingsModal.open({
                tblName: props.name,
                rawBizColumns: props.rawBizColumns as any,
                onUpdateBizColumns: props.onUpdateBizColumns as any
              })
            }
          },
          () => '设置'
        )
      case 'exportExcel': {
        if (!props.exportExcel) return null
        const exportButton = h(
          UButton,
          {
            icon: 'i-lucide-sheet',
            size: props.size,
            color: 'neutral',
            variant: 'outline',
            onClick: async () => {
              await excelExportModal.open({
                columns: props.rawBizColumns,
                filename: props.exportExcel!.filename,
                filenameWithDateTime: props.exportExcel!.filenameWithDateTime,
                listFn: props.apiGroup?.().countAndList,
                whereQueryOptions: props.whereQueryProps?.whereOptions,
                extraWhereQueryInitValues: defu(props.extraWhereQueryInitValues, props.exportExcel!.extraWhereQueryInitValues)
              })
            }
          },
          () => '导出'
        )
        if (!props.exportExcel.permissionKey) {
          return exportButton
        }
        return h(PermissionWrapper, { permission: props.exportExcel.permissionKey }, {
          default: () => exportButton
        })
      }
      case 'batchDelete':
        if (props.disableBatchDeletion) return null
        return props.selectedIds && props.selectedIds.length > 0 && h(
          UButton,
          {
            icon: 'i-lucide-trash-2',
            size: props.size,
            color: 'error',
            variant: 'outline',
            onClick: async () => {
              const result = await deleteModal.open({
                ids: props.selectedIds!,
                onDelete: (ids: number[]) => props.apiGroup?.().batchDelete({ ids })
              }).result
              if (result) {
                await props.fetchList()
              }
            }
          },
          {
            default: () => '批量删除',
            trailing: () => h(UKbd, { size: 'sm' }, () => props.selectedIds?.length ?? 0)
          }
        )
      default:
        return null
    }
  })
  const buttons = [
    ...(props.extraButtons
      ?.filter(btn => btn.appendTo === 'left')
      ?.filter(btn => btn.withBatchData ? (props.selectedIds && props.selectedIds.length > 0) : true)
      .map(btn => h(
        UButton,
        {
          ...btn.button,
          onClick: async (e) => {
            if (btn.withBatchData && props.selectedIds && btn.batchFn) {
              await btn.batchFn(props.selectedIds)
              await props.fetchList()
            }
            if (Array.isArray(btn.button.onClick)) {
              btn.button.onClick.forEach(fn => fn?.(e))
            } else {
              btn.button.onClick?.(e)
            }
          }
        }
      )) ?? []),
    ...defaultButtons,
    ...(props.extraButtons
      ?.filter(btn => btn.appendTo === 'right')
      ?.filter(btn => btn.withBatchData ? (props.selectedIds && props.selectedIds.length > 0) : true)
      .map(btn => h(
        UButton,
        {
          ...btn.button,
          onClick: async (e) => {
            if (btn.withBatchData && props.selectedIds && btn.batchFn) {
              await btn.batchFn(props.selectedIds)
            }
            if (Array.isArray(btn.button.onClick)) {
              btn.button.onClick.forEach(fn => fn?.(e))
            } else {
              btn.button.onClick?.(e)
            }
          }
        }
      )) ?? [])
  ]
  return h(
    'div',
    { class: 'flex flex-wrap items-center gap-3' },
    buttons
  )
})
</script>

<template>
  <component :is="oprButtons" />
</template>
