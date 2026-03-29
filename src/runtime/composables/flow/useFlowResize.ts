import { ref, type Ref } from 'vue'

type EdgePosition = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type FlowResizeNode = {
  id: string | number
  position: { x: number, y: number }
  style?: any
  data?: Record<string, any>
}

export interface UseFlowResizeDimensions {
  width: number
  height: number
  positionX: number
  positionY: number
}

export interface UseFlowResizeOptions {
  gridSize: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  nodes: Ref<FlowResizeNode[]>
  getViewport: () => { zoom: number } | undefined
  onResizeEnd?: (nodeId: string, dimensions: UseFlowResizeDimensions) => void
}

export interface UseFlowResizeReturn {
  resizingNode: Ref<ResizeState | null>
  hoveredNodeId: Ref<string | null>
  hoveredNodeEdge: Ref<EdgePosition | null>
  detectEdge: (event: MouseEvent, element: HTMLElement) => EdgePosition | null
  getCursorStyle: (edge: EdgePosition | null) => string
  startResize: (event: MouseEvent, nodeId: string, nodeData: any, edge: EdgePosition) => void
  handleMouseMove: (event: MouseEvent) => void
  handleMouseUp: () => void
  createNodeHandlers: (nodeId: string) => {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onMouseMove: (event: MouseEvent, element: HTMLElement) => void
  }
}

interface ResizeState {
  id: string
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startPosX: number
  startPosY: number
  edge: EdgePosition
}

export function useFlowResize(options: UseFlowResizeOptions): UseFlowResizeReturn {
  const {
    gridSize,
    minWidth = gridSize * 2,
    maxWidth = gridSize * 20,
    minHeight = gridSize * 2,
    maxHeight = gridSize * 20,
    nodes,
    getViewport,
    onResizeEnd
  } = options

  const EDGE_THRESHOLD = 8

  // 光标样式映射
  const CURSOR_MAP: Record<EdgePosition, string> = {
    'top': 'ns-resize',
    'bottom': 'ns-resize',
    'left': 'ew-resize',
    'right': 'ew-resize',
    'top-left': 'nwse-resize',
    'top-right': 'nesw-resize',
    'bottom-left': 'nesw-resize',
    'bottom-right': 'nwse-resize'
  }

  const resizingNode = ref<ResizeState | null>(null)
  const hoveredNodeId = ref<string | null>(null)
  const hoveredNodeEdge = ref<EdgePosition | null>(null)

  // 边缘检测
  const detectEdge = (event: MouseEvent, element: HTMLElement): EdgePosition | null => {
    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const nearTop = y <= EDGE_THRESHOLD
    const nearBottom = y >= rect.height - EDGE_THRESHOLD
    const nearLeft = x <= EDGE_THRESHOLD
    const nearRight = x >= rect.width - EDGE_THRESHOLD

    if (nearTop && nearLeft) return 'top-left'
    if (nearTop && nearRight) return 'top-right'
    if (nearBottom && nearLeft) return 'bottom-left'
    if (nearBottom && nearRight) return 'bottom-right'
    if (nearTop) return 'top'
    if (nearBottom) return 'bottom'
    if (nearLeft) return 'left'
    if (nearRight) return 'right'

    return null
  }

  // 获取光标样式
  const getCursorStyle = (edge: EdgePosition | null) => edge ? CURSOR_MAP[edge] : 'default'

  // 网格吸附
  const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize

  // 计算新的尺寸和位置
  const calculateNewDimensions = (
    edge: EdgePosition,
    deltaX: number,
    deltaY: number,
    startWidth: number,
    startHeight: number,
    startPosX: number,
    startPosY: number
  ) => {
    let newWidth = startWidth
    let newHeight = startHeight
    let newPosX = startPosX
    let newPosY = startPosY

    if (edge.includes('left')) {
      const rawWidth = startWidth - deltaX
      newWidth = snapToGrid(Math.max(minWidth, Math.min(maxWidth, rawWidth)))
      newPosX = startPosX + (startWidth - newWidth)
    } else if (edge.includes('right')) {
      const rawWidth = startWidth + deltaX
      newWidth = snapToGrid(Math.max(minWidth, Math.min(maxWidth, rawWidth)))
    }

    if (edge.includes('top')) {
      const rawHeight = startHeight - deltaY
      newHeight = snapToGrid(Math.max(minHeight, Math.min(maxHeight, rawHeight)))
      newPosY = startPosY + (startHeight - newHeight)
    } else if (edge.includes('bottom')) {
      const rawHeight = startHeight + deltaY
      newHeight = snapToGrid(Math.max(minHeight, Math.min(maxHeight, rawHeight)))
    }

    return { newWidth, newHeight, newPosX, newPosY }
  }

  // 开始调整大小
  const startResize = (
    event: MouseEvent,
    nodeId: string,
    nodeData: any,
    edge: EdgePosition
  ) => {
    event.stopPropagation()
    event.preventDefault()

    resizingNode.value = {
      id: nodeId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: nodeData.width || gridSize * 10,
      startHeight: nodeData.height || gridSize * 6,
      startPosX: nodeData.positionX || 0,
      startPosY: nodeData.positionY || 0,
      edge
    }
  }

  // 处理鼠标移动
  const handleMouseMove = (event: MouseEvent) => {
    if (!resizingNode.value) return

    const viewport = getViewport()
    const zoom = viewport?.zoom || 1

    const deltaX = (event.clientX - resizingNode.value.startX) / zoom
    const deltaY = (event.clientY - resizingNode.value.startY) / zoom

    const { newWidth, newHeight, newPosX, newPosY } = calculateNewDimensions(
      resizingNode.value.edge,
      deltaX,
      deltaY,
      resizingNode.value.startWidth,
      resizingNode.value.startHeight,
      resizingNode.value.startPosX,
      resizingNode.value.startPosY
    )

    const nodeIndex = nodes.value.findIndex(n => String(n.id) === resizingNode.value!.id)
    if (nodeIndex < 0) return

    const node = nodes.value[nodeIndex]
    if (!node) return

    node.position = { x: newPosX, y: newPosY }
    node.style = { ...node.style, width: `${newWidth}px`, height: `${newHeight}px` }
    node.data = { ...(node.data || {}), width: newWidth, height: newHeight, positionX: newPosX, positionY: newPosY }
  }

  // 处理鼠标释放
  const handleMouseUp = () => {
    if (!resizingNode.value) return

    const updatedNode = nodes.value.find(n => String(n.id) === resizingNode.value!.id)

    if (updatedNode && onResizeEnd) {
      onResizeEnd(String(updatedNode.id), {
        width: Number(updatedNode.data?.width ?? 0),
        height: Number(updatedNode.data?.height ?? 0),
        positionX: updatedNode.position.x,
        positionY: updatedNode.position.y
      })
    }

    resizingNode.value = null
  }

  // 节点事件处理器
  const createNodeHandlers = (nodeId: string) => ({
    onMouseEnter: () => {
      hoveredNodeId.value = nodeId
    },
    onMouseLeave: () => {
      hoveredNodeId.value = null
      hoveredNodeEdge.value = null
    },
    onMouseMove: (event: MouseEvent, element: HTMLElement) => {
      if (resizingNode.value) return
      const edge = detectEdge(event, element)
      hoveredNodeEdge.value = edge
      element.style.cursor = getCursorStyle(edge)
    }
  })

  return {
    // 状态
    resizingNode,
    hoveredNodeId,
    hoveredNodeEdge,

    // 方法
    detectEdge,
    getCursorStyle,
    startResize,
    handleMouseMove,
    handleMouseUp,
    createNodeHandlers
  }
}
