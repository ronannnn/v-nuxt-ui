import { ref } from 'vue'
import type { ShallowRef } from 'vue'
import type { Node } from '@vue-flow/core'
import type { FlowNode, UseFlowResizeDimensions } from '#v/types'
import type { ResizeEdge } from '#v/constants'

interface UseFlowResizeOptions {
  gridSize: number
  nodes: ShallowRef<Node[]>
  getViewport: () => { x: number, y: number, zoom: number }
  onResizeEnd: (nodeId: string, dimensions: UseFlowResizeDimensions) => void
}

export function useFlowResize(options: UseFlowResizeOptions) {
  const { gridSize, nodes, getViewport, onResizeEnd } = options

  const isResizing = ref(false)
  const resizingNodeId = ref<string | null>(null)
  const resizeEdge = ref<ResizeEdge | null>(null)
  const resizeStartX = ref(0)
  const resizeStartY = ref(0)
  const resizeStartWidth = ref(0)
  const resizeStartHeight = ref(0)
  const resizeStartNodeX = ref(0)
  const resizeStartNodeY = ref(0)

  const startResize = (
    event: MouseEvent,
    nodeId: string,
    node: FlowNode,
    edge: ResizeEdge
  ) => {
    event.preventDefault()
    event.stopPropagation()

    isResizing.value = true
    resizingNodeId.value = nodeId
    resizeEdge.value = edge
    resizeStartX.value = event.clientX
    resizeStartY.value = event.clientY
    resizeStartWidth.value = node.width ?? 120
    resizeStartHeight.value = node.height ?? 40
    resizeStartNodeX.value = node.positionX ?? 0
    resizeStartNodeY.value = node.positionY ?? 0

    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizing.value || !resizingNodeId.value || !resizeEdge.value) return

    const viewport = getViewport()
    const zoom = viewport.zoom

    const dx = (event.clientX - resizeStartX.value) / zoom
    const dy = (event.clientY - resizeStartY.value) / zoom

    const node = nodes.value.find(n => n.id === resizingNodeId.value)
    if (!node) return

    let newWidth = resizeStartWidth.value
    let newHeight = resizeStartHeight.value
    let newX = resizeStartNodeX.value
    let newY = resizeStartNodeY.value

    const edge = resizeEdge.value

    if (edge.includes('right')) {
      newWidth = Math.max(60, resizeStartWidth.value + dx)
    }
    if (edge.includes('left')) {
      const deltaWidth = Math.min(dx, resizeStartWidth.value - 60)
      newWidth = resizeStartWidth.value - deltaWidth
      newX = resizeStartNodeX.value + deltaWidth
    }

    if (edge.includes('bottom')) {
      newHeight = Math.max(40, resizeStartHeight.value + dy)
    }
    if (edge === 'top' || edge === 'top-left' || edge === 'top-right') {
      const deltaHeight = Math.min(dy, resizeStartHeight.value - 40)
      newHeight = resizeStartHeight.value - deltaHeight
      newY = resizeStartNodeY.value + deltaHeight
    }

    newWidth = Math.round(newWidth / gridSize) * gridSize
    newHeight = Math.round(newHeight / gridSize) * gridSize
    newX = Math.round(newX / gridSize) * gridSize
    newY = Math.round(newY / gridSize) * gridSize

    node.data = { ...node.data, width: newWidth, height: newHeight }
    node.position = { x: newX, y: newY }
  }

  const handleMouseUp = () => {
    if (isResizing.value && resizingNodeId.value) {
      const node = nodes.value.find(n => n.id === resizingNodeId.value)
      if (node) {
        onResizeEnd(resizingNodeId.value, {
          width: node.data.width ?? 120,
          height: node.data.height ?? 40
        })
      }
    }

    isResizing.value = false
    resizingNodeId.value = null
    resizeEdge.value = null
    document.body.style.userSelect = ''
  }

  return {
    isResizing,
    startResize,
    handleMouseMove,
    handleMouseUp
  }
}
