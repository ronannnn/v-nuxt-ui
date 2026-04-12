import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Node } from '@vue-flow/core'
import type { FlowNode, UseFlowResizeDimensions } from '#v/types'

type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const EDGE_THRESHOLD = 8 // 边缘检测阈值（像素）

interface UseFlowResizeOptions {
  gridSize: number
  nodes: Ref<Node[]>
  getViewport: () => { x: number, y: number, zoom: number }
  onResizeEnd: (nodeId: string, dimensions: UseFlowResizeDimensions) => void
}

/**
 * Flow 节点 Resize Composable
 * 处理节点的拖拽调整大小逻辑
 */
export function useFlowResize(options: UseFlowResizeOptions) {
  const { gridSize, nodes, getViewport, onResizeEnd } = options

  // hover 状态
  const hoveredNodeId = ref<string | null>(null)
  const hoveredNodeEdge = ref<ResizeEdge | null>(null)

  // resize 状态
  const isResizing = ref(false)
  const resizingNodeId = ref<string | null>(null)
  const resizeEdge = ref<ResizeEdge | null>(null)
  const resizeStartX = ref(0)
  const resizeStartY = ref(0)
  const resizeStartWidth = ref(0)
  const resizeStartHeight = ref(0)
  const resizeStartNodeX = ref(0)
  const resizeStartNodeY = ref(0)

  // 检测鼠标在节点边缘的位置
  const detectEdge = (mouseX: number, mouseY: number, element: HTMLElement): ResizeEdge | null => {
    const rect = element.getBoundingClientRect()
    const x = mouseX - rect.left
    const y = mouseY - rect.top
    const w = rect.width
    const h = rect.height

    const isTop = y <= EDGE_THRESHOLD
    const isBottom = y >= h - EDGE_THRESHOLD
    const isLeft = x <= EDGE_THRESHOLD
    const isRight = x >= w - EDGE_THRESHOLD

    if (isTop && isLeft) return 'top-left'
    if (isTop && isRight) return 'top-right'
    if (isBottom && isLeft) return 'bottom-left'
    if (isBottom && isRight) return 'bottom-right'
    if (isTop) return 'top'
    if (isBottom) return 'bottom'
    if (isLeft) return 'left'
    if (isRight) return 'right'
    return null
  }

  // 获取边缘对应的光标样式
  const getCursorForEdge = (edge: ResizeEdge | null): string => {
    switch (edge) {
      case 'top':
      case 'bottom':
        return 'ns-resize'
      case 'left':
      case 'right':
        return 'ew-resize'
      case 'top-left':
      case 'bottom-right':
        return 'nwse-resize'
      case 'top-right':
      case 'bottom-left':
        return 'nesw-resize'
      default:
        return 'default'
    }
  }

  // 开始 resize
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
    resizeStartNodeX.value = node.x ?? 0
    resizeStartNodeY.value = node.y ?? 0

    document.body.style.cursor = getCursorForEdge(edge)
    document.body.style.userSelect = 'none'
  }

  // 处理鼠标移动
  const handleMouseMove = (event: MouseEvent) => {
    if (isResizing.value && resizingNodeId.value && resizeEdge.value) {
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

      // 水平调整
      if (edge.includes('right')) {
        newWidth = Math.max(60, resizeStartWidth.value + dx)
      }
      if (edge.includes('left')) {
        const deltaWidth = Math.min(dx, resizeStartWidth.value - 60)
        newWidth = resizeStartWidth.value - deltaWidth
        newX = resizeStartNodeX.value + deltaWidth
      }

      // 垂直调整
      if (edge.includes('bottom')) {
        newHeight = Math.max(40, resizeStartHeight.value + dy)
      }
      if (edge === 'top' || edge === 'top-left' || edge === 'top-right') {
        const deltaHeight = Math.min(dy, resizeStartHeight.value - 40)
        newHeight = resizeStartHeight.value - deltaHeight
        newY = resizeStartNodeY.value + deltaHeight
      }

      // 对齐网格
      newWidth = Math.round(newWidth / gridSize) * gridSize
      newHeight = Math.round(newHeight / gridSize) * gridSize
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize

      // 更新节点
      node.data = { ...node.data, width: newWidth, height: newHeight }
      node.position = { x: newX, y: newY }
    }
  }

  // 处理鼠标松开
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
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  // 创建节点的 hover 事件处理器
  const createNodeHandlers = (nodeId: string) => ({
    onMouseEnter: () => {
      hoveredNodeId.value = nodeId
    },
    onMouseLeave: () => {
      if (hoveredNodeId.value === nodeId && !isResizing.value) {
        hoveredNodeId.value = null
        hoveredNodeEdge.value = null
      }
    },
    onMouseMove: (event: MouseEvent, element: HTMLElement) => {
      if (isResizing.value) return
      const edge = detectEdge(event.clientX, event.clientY, element)
      hoveredNodeEdge.value = edge

      if (edge) {
        document.body.style.cursor = getCursorForEdge(edge)
      } else {
        document.body.style.cursor = ''
      }
    }
  })

  return {
    hoveredNodeId,
    hoveredNodeEdge,
    isResizing,
    startResize,
    handleMouseMove,
    handleMouseUp,
    createNodeHandlers
  }
}
