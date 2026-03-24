import type { VColumn } from '../types/components'

/**
 * Get a reusable "createdAt" column with date formatting
 */
export const getCreatedAtColumn = <T>(): VColumn<T> => ({
  accessorKey: 'createdAt',
  header: 'Created At',
  sortOption: { defaultOpr: 'desc' },
  filterOption: { type: 'date-picker' },
  cell: ({ cell }) => {
    const value = cell.getValue() as string
    return value ? useDateFormat(value, 'YYYY-MM-DD HH:mm:ss').value : ''
  }
})

/**
 * Get reusable operation audit columns (createdAt, updatedAt, etc.)
 */
export const getOprColumns = <T>(userListApi?: any): VColumn<T>[] => {
  const columns: VColumn<T>[] = []

  if (userListApi) {
    columns.push({
      accessorKey: 'createdBy',
      header: 'Created By',
      initHide: true,
      filterOption: {
        type: 'async-select',
        listApi: userListApi,
        searchFields: ['nickname'],
        labelField: 'nickname',
        valueField: 'id'
      },
      cell: ({ row }) => (row.original as any)?.creator?.nickname ?? ''
    })
  }

  columns.push({
    accessorKey: 'createdAt',
    header: 'Created At',
    initHide: true,
    sortOption: true,
    filterOption: { type: 'date-picker' },
    cell: ({ cell }) => {
      const value = cell.getValue() as string
      return value ? useDateFormat(value, 'YYYY-MM-DD HH:mm:ss').value : ''
    }
  })

  if (userListApi) {
    columns.push({
      accessorKey: 'updatedBy',
      header: 'Updated By',
      initHide: true,
      filterOption: {
        type: 'async-select',
        listApi: userListApi,
        searchFields: ['nickname'],
        labelField: 'nickname',
        valueField: 'id'
      },
      cell: ({ row }) => (row.original as any)?.updater?.nickname ?? ''
    })
  }

  columns.push({
    accessorKey: 'updatedAt',
    header: 'Updated At',
    initHide: true,
    sortOption: true,
    filterOption: { type: 'date-picker' },
    cell: ({ cell }) => {
      const value = cell.getValue() as string
      return value ? useDateFormat(value, 'YYYY-MM-DD HH:mm:ss').value : ''
    }
  })

  return columns
}

/**
 * Get reusable execution status columns
 */
export const getExecutionColumns = <T>(statusOptions?: any[]): VColumn<T>[] => {
  const columns: VColumn<T>[] = []

  if (statusOptions) {
    columns.push({
      accessorKey: 'status',
      header: 'Status',
      filterOption: {
        type: 'select',
        items: statusOptions
      }
    })
  }

  columns.push(
    {
      accessorKey: 'executedAt',
      header: 'Executed At',
      sortOption: { defaultOpr: 'desc' },
      filterOption: { type: 'date-picker' },
      cell: ({ cell }) => {
        const value = cell.getValue() as string
        return value ? useDateFormat(value, 'YYYY-MM-DD HH:mm:ss').value : ''
      }
    },
    {
      accessorKey: 'durationMs',
      header: 'Duration (ms)',
      sortOption: true,
      filterOption: { type: 'input-number' }
    },
    {
      accessorKey: 'errorMsg',
      header: 'Error',
      initHide: true,
      filterOption: { type: 'input' }
    }
  )

  return columns
}
