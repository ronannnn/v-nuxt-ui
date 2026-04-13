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

/**
 * Flow CRUD API 接口
 * 由使用者传入，在节点/边的增删改操作时调用
 * 所有方法都是可选的，未提供时执行纯本地操作
 */
export interface FlowApi {
  /** 创建节点，返回创建后的节点（含服务端生成的 id 等字段） */
  createNode?: (node: Partial<FlowNode>) => Promise<FlowNode>
  /** 更新节点（位置、尺寸、名称等） */
  updateNode?: (node: FlowNode) => Promise<FlowNode>
  /** 删除节点 */
  deleteNode?: (nodeId: number) => Promise<void>
  /** 创建边/连接，返回创建后的边 */
  createLink?: (link: Partial<FlowNodeLink>) => Promise<FlowNodeLink>
  /** 更新边（label 等） */
  updateLink?: (link: FlowNodeLink) => Promise<FlowNodeLink>
  /** 删除边 */
  deleteLink?: (linkId: number) => Promise<void>
}
