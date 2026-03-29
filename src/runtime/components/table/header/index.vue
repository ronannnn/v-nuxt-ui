<script setup lang="ts" generic="T">
import { ProDeleteModal, ProPermissionWrapper, ProTableExcelExportModal, ProTableHeaderSettings, ProTableQueryOrder, UButton, UChip, UKbd } from '#components'
import { computed, h } from 'vue'
import { defu } from 'defu'
import { useI18n, useOverlay } from '#imports'
import type { TableHeaderProps } from '../../../types'

const props = withDefaults(defineProps<TableHeaderProps<T>>(), {
  size: 'md',
  oprOrder: () => ['create', 'refresh', 'whereQuery', 'orderQuery', 'settings', 'exportExcel', 'batchDelete']
})

const { t } = useI18n()
const overlay = useOverlay()
const deleteModal = overlay.create(ProDeleteModal)
const settingsModal = overlay.create(ProTableHeaderSettings)
const excelExportModal = overlay.create(ProTableExcelExportModal)

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
          () => t('button.new')
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
          () => t('button.refresh')
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
            () => t('button.query')
          )
        )
      case 'orderQuery':
        if (props.disableOrderQuery) return null
        return h(
            ProTableQueryOrder<T>,
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
          () => t('button.settings')
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
          () => t('button.export')
        )
        if (!props.exportExcel.permissionKey) {
          return exportButton
        }
        return h(ProPermissionWrapper, { permission: props.exportExcel.permissionKey }, {
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
