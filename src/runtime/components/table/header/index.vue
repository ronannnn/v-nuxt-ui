<script setup lang="ts" generic="T">
import { markRaw, computed } from 'vue'
import { defu } from 'defu'
import { compareObjArrays } from '#v/utils'
import { useOverlay } from '@nuxt/ui/composables'
import type { Column, TableHeaderProps, VColumn } from '#v/types'
import type { ButtonProps, DropdownMenuItem } from '@nuxt/ui'
import UButton from '@nuxt/ui/components/Button.vue'
import UChip from '@nuxt/ui/components/Chip.vue'
import UKbd from '@nuxt/ui/components/Kbd.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import UFieldGroup from '@nuxt/ui/components/FieldGroup.vue'
import PermissionWrapper from '#v/components/PermissionWrapper.vue'
import DeleteModal from '#v/components/DeleteModal.vue'
import TableHeaderSettings from '#v/components/table/header/settings/index.vue'
import TableExcelExportModal from '#v/components/table/ExcelExportModal.vue'
import { useApp } from '#v/composables'

const props = withDefaults(defineProps<TableHeaderProps<T>>(), {
  size: 'md',
  oprOrder: () => ['create', 'refresh', 'whereQuery', 'orderQuery', 'settings', 'exportExcel', 'batchDelete']
})

const app = useApp()
const isMobile = app.isMobile

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
    name: props.name,
    tblName: props.tblName ?? props.name,
    rawBizColumns: props.rawBizColumns as any,
    onUpdateBizColumns: ((cols: VColumn<T>[], storageColumns?: Column[]) => updateFn(cols, storageColumns)) as any
  })
}

async function handleExportExcel() {
  await excelExportModal.open({
    columns: props.rawBizColumns as any,
    filename: props.exportExcel!.filename,
    filenameWithDateTime: props.exportExcel!.filenameWithDateTime,
    listFn: props.apiGroup?.().countAndList,
    whereQueryOptions: props.whereQueryProps.whereOptions as any,
    extraWhereQueryInitValues: defu(props.extraWhereQueryInitValues, props.exportExcel!.extraWhereQueryInitValues),
    initWhereQuery: props.whereQueryProps.whereQuery
  })
}

async function handleBatchDelete() {
  const result = await deleteModal.open({
    ids: props.selectedIds!,
    models: props.selectedModels,
    displayFn: props.displayFnInDeleteModal,
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

// 统一的操作定义，移动端和桌面端共用
interface HeaderAction {
  key: string
  label: string
  icon?: string
  color?: ButtonProps['color']
  visible: boolean
  onSelect: () => void
}

const headerActions = computed<HeaderAction[]>(() => {
  const actions: HeaderAction[] = []

  // 左侧附加按钮
  props.extraButtons?.forEach((btn) => {
    const visible = (!btn.withBatchData || !!props.selectedIds?.length) && btn.appendTo === 'left'
    if (visible) {
      actions.push({
        key: `extra-left-${btn.button.label}`,
        label: btn.button.label ?? '',
        icon: btn.button.icon,
        visible,
        onSelect: () => onLeftExtraButtonClick(btn, new MouseEvent('click'))
      })
    }
  })

  for (const opr of props.oprOrder) {
    if (opr === 'create') {
      actions.push({
        key: 'create',
        label: '新增',
        icon: 'i-lucide-plus',
        visible: !props.disableCreation,
        onSelect: () => handleCreate()
      })
    }
    if (opr === 'refresh') {
      actions.push({
        key: 'refresh',
        label: '刷新',
        icon: 'i-lucide-refresh-ccw',
        visible: true,
        onSelect: () => props.fetchList()
      })
    }
    if (opr === 'whereQuery') {
      actions.push({
        key: 'whereQuery',
        label: '查询',
        icon: 'i-lucide-list-filter',
        visible: !props.disableWhereQuery,
        onSelect: () => props.whereQueryProps.onUpdateWhereQueryOpen?.(!props.whereQueryProps.whereQueryOpen)
      })
    }
    if (opr === 'orderQuery') {
      actions.push({
        key: 'orderQuery',
        label: '排序',
        icon: 'i-lucide-arrow-up-down',
        visible: !props.disableOrderQuery,
        onSelect: () => {
          props.orderQueryProps.onUpdateOrderQueryOpen?.(true)
        }
      })
    }
    if (opr === 'settings') {
      actions.push({
        key: 'settings',
        label: '设置',
        icon: 'i-lucide-settings',
        visible: !props.disableSettings && !!props.rawBizColumns?.length && !!props.onUpdateBizColumns,
        onSelect: () => handleSettings()
      })
    }
    if (opr === 'exportExcel') {
      actions.push({
        key: 'exportExcel',
        label: '导出',
        icon: 'i-lucide-sheet',
        visible: !!props.exportExcel,
        onSelect: () => handleExportExcel()
      })
    }
    if (opr === 'batchDelete') {
      actions.push({
        key: 'batchDelete',
        label: '批量删除',
        icon: 'i-lucide-trash-2',
        color: 'error',
        visible: !props.disableBatchDeletion && !!props.selectedIds?.length,
        onSelect: () => handleBatchDelete()
      })
    }
  }

  // 右侧附加按钮
  props.extraButtons?.forEach((btn) => {
    const visible = (!btn.withBatchData || !!props.selectedIds?.length) && btn.appendTo === 'right'
    if (visible) {
      actions.push({
        key: `extra-right-${btn.button.label}`,
        label: btn.button.label ?? '',
        icon: btn.button.icon,
        visible,
        onSelect: () => onRightExtraButtonClick(btn, new MouseEvent('click'))
      })
    }
  })

  return actions.filter(a => a.visible)
})

// 移动端下拉菜单项（排除「新增」）
const mobileMoreItems = computed<DropdownMenuItem[]>(() =>
  headerActions.value
    .filter(a => a.key !== 'create')
    .map(a => ({
      label: a.label,
      icon: a.icon,
      color: a.color,
      onSelect: a.onSelect
    }))
)
</script>

<template>
  <!-- 移动端：新增 + 更多操作下拉 -->
  <div v-if="isMobile" class="flex flex-wrap items-center gap-3">
    <UFieldGroup>
      <UButton
        v-if="!disableCreation"
        icon="i-lucide-plus"
        :size="size"
        variant="subtle"
        @click="handleCreate"
      >
        新增
      </UButton>
      <UDropdownMenu v-if="mobileMoreItems.length" :items="mobileMoreItems">
        <UButton
          icon="i-lucide-ellipsis"
          :size="size"
          color="neutral"
          variant="outline"
          :loading="fetching"
        />
      </UDropdownMenu>
    </UFieldGroup>
  </div>
  <template v-else>
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
          variant="subtle"
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

        <!-- whereQuery: toggle panel -->
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

        <UChip
          v-if="opr === 'orderQuery' && !disableOrderQuery"
          :show="!compareObjArrays(orderQueryProps.orderQuery, orderQueryProps.defaultOrderQuery)"
        >
          <UButton
            icon="i-lucide-arrow-up-down"
            :size="size"
            :color="orderQueryProps.orderQueryOpen ? 'primary' : 'neutral'"
            :loading="fetching"
            variant="outline"
            @click="orderQueryProps.onUpdateOrderQueryOpen?.(!orderQueryProps.orderQueryOpen)"
          >
            排序
          </UButton>
        </UChip>

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
            <UKbd size="sm">
              {{ selectedIds?.length ?? 0 }}
            </UKbd>
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
</template>
