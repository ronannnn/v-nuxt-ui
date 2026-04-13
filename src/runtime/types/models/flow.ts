import type { BaseModel } from './base'

export type Flow = {
  name?: string
  description?: string
  nodes?: FlowNode[]
  links?: FlowNodeLink[]
} & BaseModel

export type FlowNode = {
  flowId?: number
  name?: string
  positionX?: number
  positionY?: number
  width?: number
  height?: number
  parentLinks?: FlowNodeLink[]
  childLinks?: FlowNodeLink[]
} & BaseModel

export type FlowNodeLink = {
  flowId?: number
  parentId?: number
  parentHandlePos?: string
  childId?: number
  childHandlePos?: string
  label?: string
  condition?: string
  order?: number
} & BaseModel

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
