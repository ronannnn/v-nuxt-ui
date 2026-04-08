export enum StorageKey {
  APP = 'app',
  ACCESS_TOKEN = 'ac_t',
  REFRESH_TOKEN = 'rf_t',
  LOGIN_TYPE = 'login_type',
  FLOW_EDGE_STROKE_WIDTH = 'flow_edge_stroke_width',
  FLOW_EDGE_MARKER_START = 'flow_edge_marker_start',
  FLOW_EDGE_MARKER_END = 'flow_edge_marker_end',
  FLOW_NODE_BORDER_WIDTH = 'flow_node_border_width',

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
