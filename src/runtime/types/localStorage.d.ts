declare namespace LocalStorage {
  type Column = {
    accessorKey: string
    checked?: boolean
    width?: string | number
    fixed: 'left' | 'right' | 'unfixed'
  }
  type TableSettings<T> = {
    columns?: Column[]
    pageSize?: number
    whereQuery?: import('./query').WhereQuery<T>
    whereQueryOpen?: boolean
    orderQuery?: import('./query').OrderQuery<T>
  }
}
