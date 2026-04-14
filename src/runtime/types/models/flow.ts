import type { ApiGroup } from '../components'
import type { BaseModel } from './base'

export type Flow = {
  name?: string
  description?: string
  nodes?: FlowNode[]
  edges?: FlowEdge[]
} & BaseModel

export type FlowNode = {
  flowId?: number
  name?: string
  positionX?: number
  positionY?: number
  width?: number
  height?: number
  parentEdges?: FlowEdge[]
  childEdges?: FlowEdge[]
} & BaseModel

export type FlowEdge = {
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
  createNode?: ApiGroup<FlowNode>['create']
  /** 更新节点（位置、尺寸、名称等） */
  updateNode?: ApiGroup<FlowNode>['update']
  /** 删除节点 */
  deleteNode?: ApiGroup<FlowNode>['deleteById']
  /** 创建边/连接，返回创建后的边 */
  createEdge?: ApiGroup<FlowEdge>['create']
  /** 更新边（label 等） */
  updateEdge?: ApiGroup<FlowEdge>['update']
  /** 删除边 */
  deleteEdge?: ApiGroup<FlowEdge>['deleteById']
}
