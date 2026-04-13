import { shallowRef, watch } from 'vue'
import type { Node, Edge, Connection } from '@vue-flow/core'
import type { ComputedRef, ShallowRef } from 'vue'
import type { Flow, FlowNode, FlowNodeLink, UseFlowResizeDimensions } from '#v/types'
import { GRID_SIZE } from '#v/constants'

export interface UseFlowOptions {
  flow: ComputedRef<Flow | undefined>
  onUpdateModel?: ComputedRef<((model: Flow) => void) | undefined>
}

export interface UseFlowReturn {
  nodes: ShallowRef<Node[]>
  edges: ShallowRef<Edge[]>
  GRID_SIZE: number
  deleteNode: (nodeId: string) => Promise<void>
  deleteEdge: (edgeId: string) => Promise<void>
  createEdge: (params: Connection) => Promise<void>
  updateNodePosition: (nodeId: string, x: number, y: number) => Promise<void>
  updateNodeDimensions: (nodeId: string, dimensions: UseFlowResizeDimensions) => void
  updateNode: (updatedNode: FlowNode) => Promise<void>
  createNode: () => void
  syncNodes: (createHandlers: (nodeId: string) => Record<string, any>) => void
  updateEdgeLabel: (edgeId: string, label: string) => void
  syncEdges: (createHandlers: (edgeId: string) => Record<string, any>) => void
}

/**
 * Flow 业务逻辑 Composable
 * 管理节点和边的 CRUD 操作，并同步到外部数据模型
 */
export function useFlow(options: UseFlowOptions): UseFlowReturn {
  const { flow, onUpdateModel } = options

  // VueFlow 的节点和边数据（使用 shallowRef 避免 @vue-flow/core 深层类型的 TS2589 错误）
  const nodes = shallowRef<Node[]>([])
  const edges = shallowRef<Edge[]>([])

  // 将 FlowNode 转换为 VueFlow Node
  const toVueFlowNode = (node: FlowNode): Node => ({
    id: String(node.id),
    type: 'custom',
    position: { x: node.positionX ?? 0, y: node.positionY ?? 0 },
    data: {
      ...node,
      id: node.id,
      name: node.name,
      width: node.width,
      height: node.height
    }
  })

  // 将 FlowNodeLink 转换为 VueFlow Edge
  const toVueFlowEdge = (link: FlowNodeLink): Edge => ({
    id: String(link.id),
    type: 'custom',
    source: String(link.parentId),
    target: String(link.childId),
    sourceHandle: link.parentHandlePos ?? undefined,
    targetHandle: link.childHandlePos ?? undefined,
    label: link.label
  })

  // 从 Flow 数据初始化
  watch(
    () => flow.value,
    (newFlow) => {
      if (!newFlow) return
      nodes.value = (newFlow.nodes ?? []).map(toVueFlowNode)
      edges.value = (newFlow.links ?? []).map(toVueFlowEdge)
    },
    { immediate: true }
  )

  // 通知外部数据更新
  const emitUpdate = () => {
    if (!onUpdateModel?.value) return

    const updatedFlow: Flow = {
      id: flow.value?.id ?? 0,
      ...flow.value,
      nodes: nodes.value.map(n => ({
        id: n.data.id ?? Number(n.id),
        name: n.data.name ?? '',
        positionX: n.position.x,
        positionY: n.position.y,
        width: n.data.width,
        height: n.data.height
      } as FlowNode)),
      links: edges.value.map(e => ({
        id: Number(e.id) || undefined,
        parentId: Number(e.source),
        childId: Number(e.target),
        parentHandlePos: e.sourceHandle ?? undefined,
        childHandlePos: e.targetHandle ?? undefined,
        label: typeof e.label === 'string' ? e.label : undefined
      } as FlowNodeLink))
    }
    onUpdateModel.value(updatedFlow)
  }

  // 删除节点
  const deleteNode = async (nodeId: string) => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    // 同时删除相关的边
    edges.value = edges.value.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )
    emitUpdate()
  }

  // 删除边
  const deleteEdge = async (edgeId: string) => {
    edges.value = edges.value.filter(e => e.id !== edgeId)
    emitUpdate()
  }

  // 创建边
  const createEdge = async (params: Connection) => {
    const newEdge: Edge = {
      id: `e-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}-${Date.now()}`,
      type: 'custom',
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle ?? undefined,
      targetHandle: params.targetHandle ?? undefined
    }
    edges.value = [...edges.value, newEdge]
    emitUpdate()
  }

  // 更新节点位置
  const updateNodePosition = async (nodeId: string, x: number, y: number) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.position = { x, y }
      emitUpdate()
    }
  }

  // 更新节点尺寸
  const updateNodeDimensions = (nodeId: string, dimensions: UseFlowResizeDimensions) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.data = {
        ...node.data,
        width: dimensions.width,
        height: dimensions.height
      }
      emitUpdate()
    }
  }

  // 更新边标签
  const updateEdgeLabel = (edgeId: string, label: string) => {
    const edge = edges.value.find(e => e.id === edgeId)
    if (edge) {
      edge.label = label || undefined
      emitUpdate()
    }
  }

  // 更新节点数据
  const updateNode = async (updatedNode: FlowNode) => {
    const index = nodes.value.findIndex(n => n.id === String(updatedNode.id))
    if (index !== -1) {
      nodes.value[index]!.data = {
        ...nodes.value[index]!.data,
        ...updatedNode,
        id: updatedNode.id,
        name: updatedNode.name
      }
      emitUpdate()
    }
  }

  // 创建新节点
  const createNode = () => {
    const id = Date.now()
    const newNode: Node = {
      id: String(id),
      type: 'custom',
      position: {
        x: Math.round((200 + Math.random() * 200) / GRID_SIZE) * GRID_SIZE,
        y: Math.round((200 + Math.random() * 200) / GRID_SIZE) * GRID_SIZE
      },
      data: {
        id,
        name: `节点 ${nodes.value.length + 1}`,
        width: 120,
        height: 40
      }
    }
    nodes.value = [...nodes.value, newNode]
    emitUpdate()
  }

  // 同步节点数据（添加事件处理器和样式）
  const syncNodes = (createHandlers: (nodeId: string) => Record<string, any>) => {
    nodes.value.forEach((node) => {
      const handlers = createHandlers(node.id)
      Object.assign(node.data, handlers)
    })
  }

  // 同步边数据（添加事件处理器）
  const syncEdges = (createHandlers: (edgeId: string) => Record<string, any>) => {
    edges.value.forEach((edge) => {
      const handlers = createHandlers(edge.id)
      if (!edge.data) edge.data = {}
      Object.assign(edge.data, handlers)
    })
  }

  return {
    nodes,
    edges,
    GRID_SIZE,
    deleteNode,
    deleteEdge,
    createEdge,
    updateNodePosition,
    updateNodeDimensions,
    updateNode,
    createNode,
    syncNodes,
    updateEdgeLabel,
    syncEdges
  }
}
