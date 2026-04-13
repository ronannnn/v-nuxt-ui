import { shallowRef, ref, watch } from 'vue'
import type { Node, Edge, Connection } from '@vue-flow/core'
import type { ComputedRef, ShallowRef, Ref } from 'vue'
import type { Flow, FlowNode, FlowNodeLink, FlowApi, UseFlowResizeDimensions } from '#v/types'
import { GRID_SIZE } from '#v/constants'

export interface UseFlowOptions {
  flow: ComputedRef<Flow | undefined>
  onUpdateModel?: ComputedRef<((model: Flow) => void) | undefined>
  /** CRUD API 回调，在节点/边增删改时调用 */
  api?: ComputedRef<FlowApi | undefined>
}

export interface UseFlowReturn {
  nodes: ShallowRef<Node[]>
  edges: ShallowRef<Edge[]>
  GRID_SIZE: number
  /** 是否有 API 操作正在进行 */
  loading: Ref<boolean>
  deleteNode: (nodeId: string) => Promise<void>
  deleteEdge: (edgeId: string) => Promise<void>
  createEdge: (params: Connection) => Promise<void>
  /** 重连边：乐观更新，立即移动到新位置（带 opacity），API 完成后恢复 */
  reconnectEdge: (oldEdgeId: string, connection: Connection) => Promise<void>
  updateNodePosition: (nodeId: string, x: number, y: number) => Promise<void>
  updateNodeDimensions: (nodeId: string, dimensions: UseFlowResizeDimensions) => Promise<void>
  updateNode: (updatedNode: FlowNode) => Promise<void>
  createNode: () => Promise<void>
  syncNodes: (createHandlers: (nodeId: string) => Record<string, any>) => void
  updateEdgeLabel: (edgeId: string, label: string) => Promise<void>
  syncEdges: (createHandlers: (edgeId: string) => Record<string, any>) => void
}

/**
 * Flow 业务逻辑 Composable
 * 管理节点和边的 CRUD 操作，并同步到外部数据模型
 */
export function useFlow(options: UseFlowOptions): UseFlowReturn {
  const { flow, onUpdateModel, api } = options

  // VueFlow 的节点和边数据（使用 shallowRef 避免 @vue-flow/core 深层类型的 TS2589 错误）
  const nodes = shallowRef<Node[]>([])
  const edges = shallowRef<Edge[]>([])

  // Loading 状态：追踪并发 API 请求数量
  const _pendingCount = ref(0)
  const loading = ref(false)

  /** 包装异步操作，自动管理 loading 状态 */
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    _pendingCount.value++
    loading.value = true
    try {
      return await fn()
    }
    finally {
      _pendingCount.value--
      if (_pendingCount.value <= 0) {
        _pendingCount.value = 0
        loading.value = false
      }
    }
  }

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
    const doDelete = async () => {
      // 调用 API 删除节点
      if (api?.value?.deleteNode) {
        await api.value.deleteNode(Number(nodeId))
      }
      // 找到需要删除的关联边，逐一调用 API
      if (api?.value?.deleteLink) {
        const relatedEdges = edges.value.filter(
          e => e.source === nodeId || e.target === nodeId
        )
        for (const edge of relatedEdges) {
          const linkId = Number(edge.id)
          if (!Number.isNaN(linkId)) {
            await api.value.deleteLink(linkId)
          }
        }
      }
      nodes.value = nodes.value.filter(n => n.id !== nodeId)
      // 同时删除相关的边
      edges.value = edges.value.filter(
        e => e.source !== nodeId && e.target !== nodeId
      )
      emitUpdate()
    }
    if (api?.value) await withLoading(doDelete)
    else await doDelete()
  }

  // 删除边
  const deleteEdge = async (edgeId: string) => {
    const doDelete = async () => {
      if (api?.value?.deleteLink) {
        const linkId = Number(edgeId)
        if (!Number.isNaN(linkId)) {
          await api.value.deleteLink(linkId)
        }
      }
      edges.value = edges.value.filter(e => e.id !== edgeId)
      emitUpdate()
    }
    if (api?.value) await withLoading(doDelete)
    else await doDelete()
  }

  // 创建边
  const createEdge = async (params: Connection) => {
    const doCreate = async () => {
      let edgeId = `e-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}-${Date.now()}`
      let label: string | undefined

      if (api?.value?.createLink) {
        const created = await api.value.createLink({
          flowId: flow.value?.id,
          parentId: Number(params.source),
          childId: Number(params.target),
          parentHandlePos: params.sourceHandle ?? undefined,
          childHandlePos: params.targetHandle ?? undefined
        })
        edgeId = String(created.id)
        label = created.label
      }

      const newEdge: Edge = {
        id: edgeId,
        type: 'custom',
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
        label
      }
      edges.value = [...edges.value, newEdge]
      emitUpdate()
    }
    if (api?.value) await withLoading(doCreate)
    else await doCreate()
  }

  // 重连边（乐观更新：立即移动到新位置，带 opacity 表示 pending 状态）
  const reconnectEdge = async (oldEdgeId: string, connection: Connection) => {
    // 没有 API 时，直接本地删旧建新
    if (!api?.value) {
      edges.value = edges.value.filter(e => e.id !== oldEdgeId)
      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}-${Date.now()}`,
        type: 'custom',
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined
      }
      edges.value = [...edges.value, newEdge]
      emitUpdate()
      return
    }

    // 保存旧边（用于 rollback）
    const oldEdge = edges.value.find(e => e.id === oldEdgeId)
    const oldEdgeBackup = oldEdge ? { ...oldEdge } : undefined

    // 乐观更新：立即替换为新边，带 opacity 表示 pending
    const tempId = `e-pending-${Date.now()}`
    const pendingEdge: Edge = {
      id: tempId,
      type: 'custom',
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? undefined,
      targetHandle: connection.targetHandle ?? undefined,
      label: oldEdge?.label,
      style: { ...((oldEdge?.style as Record<string, any>) ?? {}), opacity: 0.5 }
    }
    edges.value = [...edges.value.filter(e => e.id !== oldEdgeId), pendingEdge]
    emitUpdate()

    // 后台调用 API
    await withLoading(async () => {
      try {
        // 1. 删除旧边
        if (api.value?.deleteLink) {
          const linkId = Number(oldEdgeId)
          if (!Number.isNaN(linkId)) {
            await api.value.deleteLink(linkId)
          }
        }

        // 2. 创建新边
        let finalId = tempId
        let label: string | undefined = typeof pendingEdge.label === 'string' ? pendingEdge.label : undefined

        if (api.value?.createLink) {
          const created = await api.value.createLink({
            flowId: flow.value?.id,
            parentId: Number(connection.source),
            childId: Number(connection.target),
            parentHandlePos: connection.sourceHandle ?? undefined,
            childHandlePos: connection.targetHandle ?? undefined
          })
          finalId = String(created.id)
          label = created.label
        }

        // 3. 成功：用最终数据替换 pending 边，移除 opacity
        const idx = edges.value.findIndex(e => e.id === tempId)
        if (idx !== -1) {
          const { opacity: _, ...restStyle } = (edges.value[idx]!.style as Record<string, any>) ?? {}
          edges.value[idx] = {
            ...edges.value[idx]!,
            id: finalId,
            label,
            style: Object.keys(restStyle).length > 0 ? restStyle : undefined
          } as Edge
          edges.value = [...edges.value]
          emitUpdate()
        }
      }
      catch {
        // 失败：rollback，恢复旧边
        edges.value = edges.value.filter(e => e.id !== tempId)
        if (oldEdgeBackup) {
          edges.value = [...edges.value, oldEdgeBackup]
        }
        emitUpdate()
      }
    })
  }

  // 更新节点位置
  const updateNodePosition = async (nodeId: string, x: number, y: number) => {
    const doUpdate = async () => {
      const node = nodes.value.find(n => n.id === nodeId)
      if (node) {
        if (api?.value?.updateNode) {
          await api.value.updateNode({
            ...node.data,
            id: node.data.id ?? Number(nodeId),
            positionX: x,
            positionY: y
          } as FlowNode)
        }
        node.position = { x, y }
        emitUpdate()
      }
    }
    if (api?.value) await withLoading(doUpdate)
    else await doUpdate()
  }

  // 更新节点尺寸
  const updateNodeDimensions = async (nodeId: string, dimensions: UseFlowResizeDimensions) => {
    const doUpdate = async () => {
      const node = nodes.value.find(n => n.id === nodeId)
      if (node) {
        if (api?.value?.updateNode) {
          await api.value.updateNode({
            ...node.data,
            id: node.data.id ?? Number(nodeId),
            width: dimensions.width,
            height: dimensions.height
          } as FlowNode)
        }
        node.data = {
          ...node.data,
          width: dimensions.width,
          height: dimensions.height
        }
        emitUpdate()
      }
    }
    if (api?.value) await withLoading(doUpdate)
    else await doUpdate()
  }

  // 更新边标签
  const updateEdgeLabel = async (edgeId: string, label: string) => {
    const doUpdate = async () => {
      const edge = edges.value.find(e => e.id === edgeId)
      if (edge) {
        if (api?.value?.updateLink) {
          const linkId = Number(edgeId)
          if (!Number.isNaN(linkId)) {
            await api.value.updateLink({
              id: linkId,
              parentId: Number(edge.source),
              childId: Number(edge.target),
              parentHandlePos: edge.sourceHandle ?? undefined,
              childHandlePos: edge.targetHandle ?? undefined,
              label: label || undefined
            } as FlowNodeLink)
          }
        }
        edge.label = label || undefined
        emitUpdate()
      }
    }
    if (api?.value) await withLoading(doUpdate)
    else await doUpdate()
  }

  // 更新节点数据
  const updateNode = async (updatedNode: FlowNode) => {
    const doUpdate = async () => {
      const index = nodes.value.findIndex(n => n.id === String(updatedNode.id))
      if (index !== -1) {
        if (api?.value?.updateNode) {
          await api.value.updateNode(updatedNode)
        }
        nodes.value[index]!.data = {
          ...nodes.value[index]!.data,
          ...updatedNode,
          id: updatedNode.id,
          name: updatedNode.name
        }
        emitUpdate()
      }
    }
    if (api?.value) await withLoading(doUpdate)
    else await doUpdate()
  }

  // 创建新节点
  const createNode = async () => {
    const doCreate = async () => {
      const positionX = Math.round((200 + Math.random() * 200) / GRID_SIZE) * GRID_SIZE
      const positionY = Math.round((200 + Math.random() * 200) / GRID_SIZE) * GRID_SIZE
      const defaultName = `节点 ${nodes.value.length + 1}`

      let nodeId = Date.now()
      let nodeName = defaultName
      let nodeWidth = 120
      let nodeHeight = 40

      if (api?.value?.createNode) {
        const created = await api.value.createNode({
          flowId: flow.value?.id,
          name: defaultName,
          positionX,
          positionY,
          width: 120,
          height: 40
        })
        nodeId = created.id
        nodeName = created.name ?? defaultName
        nodeWidth = created.width ?? 120
        nodeHeight = created.height ?? 40
      }

      const newNode: Node = {
        id: String(nodeId),
        type: 'custom',
        position: { x: positionX, y: positionY },
        data: {
          id: nodeId,
          name: nodeName,
          width: nodeWidth,
          height: nodeHeight
        }
      }
      nodes.value = [...nodes.value, newNode]
      emitUpdate()
    }
    if (api?.value) await withLoading(doCreate)
    else await doCreate()
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
    loading,
    deleteNode,
    deleteEdge,
    createEdge,
    reconnectEdge,
    updateNodePosition,
    updateNodeDimensions,
    updateNode,
    createNode,
    syncNodes,
    updateEdgeLabel,
    syncEdges
  }
}
