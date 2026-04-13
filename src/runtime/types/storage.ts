export enum StorageKey {
  APP = 'app',
  ACCESS_TOKEN = 'ac_t',
  REFRESH_TOKEN = 'rf_t',
  LOGIN_TYPE = 'login_type',
  FLOW_EDGE_STYLES = 'flow_edge_styles',
  FLOW_NODE_STYLES = 'flow_node_styles',
  FLOW_COLOR_MODE = 'flow_color_mode',

  // echarts
  ECHART_ROTATE_X_AXIS_LABEL = 'echart_rotate_x_axis_label'

}

export type Column = {
  accessorKey: string
  checked?: boolean
  width?: string | number
  fixed: 'left' | 'right' | 'unfixed'
}

export type TableSettings<T> = {
  columns?: Column[]
  pageSize?: number
  whereQuery?: import('./query').WhereQuery<T>
  whereQueryOpen?: boolean
  orderQuery?: import('./query').OrderQuery<T>
}
