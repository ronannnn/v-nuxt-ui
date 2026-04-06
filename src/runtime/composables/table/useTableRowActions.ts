import { ref, h } from 'vue'
import type { RowActionProps, VColumn } from '#v/types'
import type { DropdownMenuItem, TableRow } from '@nuxt/ui'
import { useOverlay } from '@nuxt/ui/composables'
import DeleteModal from '#v/components/DeleteModal.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import UButton from '@nuxt/ui/components/Button.vue'

export function useTableRowActions<T>(props: {
  rowKey: keyof T
  disableRowActions?: boolean
  disableRowUpdate?: boolean
  disableRowCopy?: boolean
  disableRowDeletion?: boolean
  onEditRowFromModal?: (...args: any[]) => any
  extraRowActions?: any[]
  useApiGroup?: (...args: any[]) => any
  customRowCopyFn?: (...args: any[]) => any
  fetchList: () => Promise<void>
}) {
  const {
    rowKey,
    disableRowActions: _disableRowActions,
    disableRowUpdate,
    disableRowCopy,
    disableRowDeletion,
    onEditRowFromModal,
    extraRowActions,
    useApiGroup,
    customRowCopyFn,
    fetchList
  } = props

  const overlay = useOverlay()
  const deleteModal = overlay.create(DeleteModal)
  const apiGroup = useApiGroup?.()
  const actionLoadingRowIdxSet = ref<Set<number>>(new Set())

  function getRowActions(row: TableRow<T>) {
    const actionItems: DropdownMenuItem[] = []

    if (!disableRowUpdate && onEditRowFromModal) {
      actionItems.push({
        label: '编辑',
        icon: 'i-lucide-clipboard-pen-line',
        onClick: async () => {
          const result = await onEditRowFromModal(row.original)
          if (result) {
            await fetchList()
          }
        }
      })
    }

    if (!disableRowCopy && onEditRowFromModal) {
      const copyFn = customRowCopyFn ?? apiGroup?.copy
      actionItems.push({
        label: '复制',
        icon: 'i-lucide-clipboard-plus',
        onClick: async () => {
          const result = await onEditRowFromModal(copyFn!(row.original))
          if (result) {
            await fetchList()
          }
        }
      })
    }

    // 支持递归的 extraRowActions -> DropdownMenuItem 转换
    const buildActionItem = (action: RowActionProps<T>): DropdownMenuItem => {
      const item: DropdownMenuItem = {
        label: action.label,
        icon: action.icon,
        type: action.type,
        color: action.color
      }

      if (action.children && action.children.length > 0) {
        item.children = action.children.map(buildActionItem)
        return item
      }

      item.onClick = async () => {
        if (action.fn) {
          try {
            action.fn(row.original)
          } catch (e) {
            // ignore sync errors here
            console.error('Error in row action fn:', e)
          }
          if (action.refetchAfterFn) {
            await fetchList()
          }
        }

        if (action.asyncFn) {
          actionLoadingRowIdxSet.value.add(row.index)
          try {
            await action.asyncFn(row.original)
          } finally {
            actionLoadingRowIdxSet.value.delete(row.index)
          }
        }

        if (action.fnWithModal) {
          const result = await action.fnWithModal(row.original)
          if (result) {
            await fetchList()
          }
        }
      }

      return item
    }

    extraRowActions?.forEach((action) => {
      actionItems.push(buildActionItem(action))
    })

    if (!disableRowDeletion) {
      if (actionItems.length > 0) {
        actionItems.push({ type: 'separator' })
      }
      actionItems.push({
        label: '删除',
        icon: 'i-lucide-trash-2',
        color: 'error',
        onSelect: async () => {
          const result = await deleteModal.open({
            ids: [row.original[rowKey] as number],
            onDelete: (ids: number[]) => apiGroup?.batchDelete({ ids })
          }).result
          if (result) {
            await fetchList()
          }
        }
      })
    }

    actionItems.unshift({
      type: 'label',
      label: '操作'
    })

    return actionItems
  }

  function generateActionColumn(): VColumn<T> {
    return {
      id: 'actions',
      accessorKey: 'actions',
      header: '操作',
      meta: {
        class: {
          th: 'w-15 min-w-15 px-4'
        }
      },
      cell: ({ row }) => {
        return h(
          'div',
          { class: 'text-center' },
          h(
            UDropdownMenu,
            {
              content: {
                align: 'end'
              },
              items: getRowActions(row)
            },
            {
              'default': () => h(UButton, {
                icon: 'i-lucide-ellipsis',
                color: 'neutral',
                variant: 'ghost',
                size: 'sm',
                loading: actionLoadingRowIdxSet.value.has(row.index),
                class: 'ml-auto'
              }),
              'item': () => null,
              'item-leading': () => null,
              'item-label': () => null,
              'item-description': () => null,
              'item-trailing': () => null,
              'content-top': () => null,
              'content-bottom': () => null
            }
          )
        )
      }
    }
  }

  return {
    getRowActions,
    generateActionColumn,
    actionLoadingRowIdxSet
  }
}
