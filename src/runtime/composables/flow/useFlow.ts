import { ref, watch } from 'vue'
import { MarkerType, type Edge, type Node } from '@vue-flow/core'
import type { Ref } from 'vue'
import { useFlowApi, useFlowNodeApi, useFlowNodeLinkApi } from '#v/composables'

export interface UseFlowOptions {
  flow?: Ref<Model.Flow | undefined>
  onUpdateModel?: Ref<((model: Model.Flow) => void) | undefined>
}

/**
 * Flow 业务逻辑 Composable
 * 处理节点和边的 CRUD 操作、数据转换等
 */
export function useFlow(options: UseFlowOptions) {
  const { flow, onUpdateModel } = options

  // 常量定义
  const GRID_SIZE = 16
  const DEFAULT_NODE_WIDTH = GRID_SIZE * 10
  const DEFAULT_NODE_HEIGHT = GRID_SIZE * 6

  // API
  const flowApi = useFlowApi()
  const flowNodeApi = useFlowNodeApi()
  const flowNodeLinkApi = useFlowNodeLinkApi()

  // 状态管理
  const nodes = ref<Node[]>([])
  const edges = ref<Edge[]>([])

  // 清理 handle 后缀
  const cleanHandleId = (handleId?: string | null) => handleId?.replace(/-(source|target)$/, '')

  // 刷新数据
  const refreshFlow = async () => {
    if (!flow?.value?.id) return
    const { data } = await flowApi.getById(flow.value.id)
    if (data.value?.data && onUpdateModel?.value) {
      onUpdateModel.value(data.value.data)
    }
  }

  // 根据后端数据结构转换为VueFlow的节点数据
  const transformNode = (node: Model.FlowNode, handlers?: any): Node => ({
    id: String(node.id),
    type: 'custom',
    position: { x: node.positionX || 0, y: node.positionY || 0 },
    label: node.name || '',
    selectable: true,
    style: {
      width: node.width ? `${node.width}px` : undefined,
      height: node.height ? `${node.height}px` : undefined
    },
    data: {
      ...node,
      ...handlers
    }
  })

  // 根据后端数据结构转换为VueFlow的连接数据
  const transformEdge = (link: Model.FlowNodeLink, styleOptions?: {
    strokeWidth?: number
    markerStart?: boolean
    markerEnd?: boolean
  }): Edge => ({
    id: String(link.id),
    type: 'custom',
    source: String(link.parentId),
    sourceHandle: link.parentHandlePos ? cleanHandleId(link.parentHandlePos) : null,
    target: String(link.childId),
    targetHandle: link.childHandlePos ? cleanHandleId(link.childHandlePos) : null,
    label: link.label || '',
    selectable: true,
    style: styleOptions?.strokeWidth ? { strokeWidth: styleOptions.strokeWidth } : undefined,
    markerStart: styleOptions?.markerStart ? MarkerType.Arrow : undefined,
    markerEnd: styleOptions?.markerEnd ? MarkerType.Arrow : undefined,
    data: { ...link }
  })

  // 同步节点到前端（仅更新前端状态）
  const syncNodes = (nodeHandlers?: (nodeId: string) => any) => {
    if (!flow?.value) return
    nodes.value = (flow.value.nodes || []).map(node =>
      transformNode(node, nodeHandlers ? nodeHandlers(String(node.id)) : undefined)
    )
  }

  // 同步边到前端（仅更新前端状态）
  const syncEdges = (styleOptions?: {
    strokeWidth?: number
    markerStart?: boolean
    markerEnd?: boolean
  }) => {
    if (!flow?.value) return
    edges.value = (flow.value.links || []).map(link => transformEdge(link, styleOptions))
  }

  // 应用边的样式
  const applyEdgeStyles = (styleOptions: {
    strokeWidth: number
    markerStart: boolean
    markerEnd: boolean
  }) => {
    syncEdges(styleOptions)
  }

  // 更新节点到后端（更新后端数据）
  const updateNode = async (updatedNode: Model.FlowNode) => {
    await flowNodeApi.update(updatedNode)
    await refreshFlow()
  }

  // 删除节点
  const deleteNode = async (nodeId: string) => {
    const node = flow?.value?.nodes?.find(n => String(n.id) === nodeId)
    if (!node?.id) return

    // 批量删除相关的连接
    const relatedLinkIds = flow?.value?.links
      ?.filter(link => link.parentId === node.id || link.childId === node.id)
      ?.map(link => link.id)
      ?.filter((id): id is number => id !== undefined) || []

    if (relatedLinkIds.length > 0) {
      await flowNodeLinkApi.batchDelete({ ids: relatedLinkIds })
    }

    await flowNodeApi.deleteById(node.id)
    await refreshFlow()
  }

  // 删除连接
  const deleteEdge = async (edgeId: string) => {
    const link = flow?.value?.links?.find(l => String(l.id) === edgeId)
    if (!link?.id) return

    await flowNodeLinkApi.deleteById(link.id)
    await refreshFlow()
  }

  // 创建连接
  const createEdge = async (params: {
    source: string
    target: string
    sourceHandle?: string | null
    targetHandle?: string | null
  }) => {
    if (!flow?.value) return

    const newLink: Model.FlowNodeLink = {
      id: 0,
      flowId: flow.value.id,
      parentId: Number(params.source),
      parentHandlePos: cleanHandleId(params.sourceHandle),
      childId: Number(params.target),
      childHandlePos: cleanHandleId(params.targetHandle),
      label: ''
    }

    await flowNodeLinkApi.create(newLink)
    await refreshFlow()
  }

  // 更新节点位置到后端（更新后端数据）
  const updateNodePosition = async (nodeId: string, x: number, y: number) => {
    const originalNode = flow?.value?.nodes?.find(n => String(n.id) === nodeId)
    if (!originalNode) return

    await flowNodeApi.update({
      id: originalNode.id,
      version: originalNode.version,
      positionX: x,
      positionY: y
    })
    await refreshFlow()
  }

  // 更新节点尺寸和位置到后端（更新后端数据）
  const updateNodeDimensions = async (
    nodeId: string,
    dimensions: {
      width: number
      height: number
      positionX: number
      positionY: number
    }
  ) => {
    const node = flow?.value?.nodes?.find(n => String(n.id) === nodeId)
    if (!node) return

    await flowNodeApi.update({
      id: node.id,
      version: node.version,
      ...dimensions
    })
    await refreshFlow()
  }

  // 创建节点到后端（新增后端数据）
  const createNode = async () => {
    if (!flow?.value) return

    const nodeCount = flow.value.nodes?.length || 0
    const newNode: Model.FlowNode = {
      id: 0,
      flowId: flow.value.id,
      name: `节点 ${nodeCount + 1}`,
      positionX: GRID_SIZE * (10 + nodeCount * 3),
      positionY: GRID_SIZE * (10 + nodeCount * 3),
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT
    }

    await flowNodeApi.create(newNode)
    await refreshFlow()
  }

  // 监听 flow 变化，同步节点和边
  watch(
    () => flow?.value,
    (newFlow) => {
      if (!newFlow) return
      syncEdges()
    },
    { immediate: true, deep: true }
  )

  return {
    // 状态
    nodes,
    edges,
    GRID_SIZE,

    // 前端操作方法（仅更新前端状态）
    syncNodes,
    syncEdges,
    applyEdgeStyles,
    transformNode,

    // 后端操作方法（调用 API 更新后端）
    refreshFlow,
    updateNode,
    updateNodePosition,
    updateNodeDimensions,
    createNode,
    deleteNode,
    deleteEdge,
    createEdge
  }
}
