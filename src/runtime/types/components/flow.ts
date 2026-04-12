/**
 * Flow 节点类型
 */
export interface FlowNode {
  id: number | string
  name: string
  x?: number
  y?: number
  width?: number
  height?: number
  [key: string]: any
}

/**
 * Flow 连接线类型
 */
export interface FlowEdge {
  id: number | string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
  [key: string]: any
}

/**
 * Flow 数据模型
 */
export interface Flow {
  id?: number | string
  name?: string
  nodes?: FlowNode[]
  edges?: FlowEdge[]
}

/**
 * 鼠标位置类型
 */
export interface FlowMousePosition {
  x: number
  y: number
}

/**
 * Resize 尺寸类型
 */
export interface UseFlowResizeDimensions {
  width: number
  height: number
}
