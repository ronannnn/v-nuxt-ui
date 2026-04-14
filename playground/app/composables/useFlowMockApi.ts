import { ref } from 'vue'
import type { FlowApi, FlowNode, FlowNodeLink, RequestResult } from '#v/types'

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

  const createLink: FlowApi['createLink'] = async (link) => {
    await delay()
    const id = nextLinkId++
    const created: FlowNodeLink = {
      id,
      flowId: link.flowId,
      parentId: link.parentId,
      childId: link.childId,
      parentHandlePos: link.parentHandlePos,
      childHandlePos: link.childHandlePos,
      label: link.label
    }
    console.log('[FlowApi] createLink:', created)
    return success(created)
  }

  const updateLink: FlowApi['updateLink'] = async (link) => {
    await delay()
    console.log('[FlowApi] updateLink:', link)
    return success(link)
  }

  const deleteLink: FlowApi['deleteLink'] = async (linkId) => {
    await delay()
    console.log('[FlowApi] deleteLink:', linkId)
    return success(undefined)
  }

  return {
    createNode,
    updateNode,
    deleteNode,
    createLink,
    updateLink,
    deleteLink
  }
}
