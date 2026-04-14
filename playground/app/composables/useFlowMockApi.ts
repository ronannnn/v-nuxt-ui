import { ref } from 'vue'
import type { FlowApi, FlowNode, FlowEdge, RequestResult } from '#v/types'

/**
 * Mock FlowApi 实现，用于 playground 演示
 * 模拟异步 CRUD 操作，带有模拟延迟
 */
export function useFlowMockApi(): FlowApi {
  let nextNodeId = 100
  let nextLinkId = 100

  const delay = (ms = 200) => new Promise<void>(resolve => setTimeout(resolve, ms))
  const success = <T>(payload: T) => ({
    data: ref<RequestResult<T>>({
      error: null,
      data: payload
    })
  })

  const createNode: FlowApi['createNode'] = async (node) => {
    await delay()
    const id = nextNodeId++
    const created: FlowNode = {
      id,
      flowId: node.flowId,
      name: node.name ?? `节点 ${id}`,
      positionX: node.positionX ?? 0,
      positionY: node.positionY ?? 0,
      width: node.width ?? 120,
      height: node.height ?? 40
    }
    console.log('[FlowApi] createNode:', created)
    return success(created)
  }

  const updateNode: FlowApi['updateNode'] = async (node) => {
    await delay()
    console.log('[FlowApi] updateNode:', node)
    return success(node)
  }

  const deleteNode: FlowApi['deleteNode'] = async (nodeId) => {
    await delay()
    console.log('[FlowApi] deleteNode:', nodeId)
    return success(undefined)
  }

  const createEdge: FlowApi['createEdge'] = async (edge) => {
    await delay()
    const id = nextLinkId++
    const created: FlowEdge = {
      id,
      flowId: edge.flowId,
      parentId: edge.parentId,
      childId: edge.childId,
      parentHandlePos: edge.parentHandlePos,
      childHandlePos: edge.childHandlePos,
      label: edge.label
    }
    console.log('[FlowApi] createEdge:', created)
    return success(created)
  }

  const updateEdge: FlowApi['updateEdge'] = async (edge) => {
    await delay()
    console.log('[FlowApi] updateEdge:', edge)
    return success(edge)
  }

  const deleteEdge: FlowApi['deleteEdge'] = async (edgeId) => {
    await delay()
    console.log('[FlowApi] deleteEdge:', edgeId)
    return success(undefined)
  }

  return {
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    updateEdge,
    deleteEdge
  }
}
