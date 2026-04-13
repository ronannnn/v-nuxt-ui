import { StorageKey } from '#v/types'
import { useLocalStorage } from '@vueuse/core'
import type { FlowEdgeStrokeType, FlowEdgePathType } from '#v/constants'

/**
 * Flow 样式设置 Composable
 * 管理连接线和节点的样式配置
 */
export function useFlowStyles() {
  // 连接线粗细 (1-5)
  const edgeStrokeWidth = useLocalStorage(StorageKey.FLOW_EDGE_STROKE_WIDTH, 2)

  // 连接线起点箭头
  const edgeMarkerStart = useLocalStorage(StorageKey.FLOW_EDGE_MARKER_START, false)

  // 连接线终点箭头
  const edgeMarkerEnd = useLocalStorage(StorageKey.FLOW_EDGE_MARKER_END, true)

  // 连接线动画（dash 流动效果）
  const edgeAnimated = useLocalStorage(StorageKey.FLOW_EDGE_ANIMATED, false)

  // 连接线线型
  const edgeStrokeType = useLocalStorage<FlowEdgeStrokeType>(StorageKey.FLOW_EDGE_STROKE_TYPE, 'solid')

  // 连接线路径类型
  const edgePathType = useLocalStorage<FlowEdgePathType>(StorageKey.FLOW_EDGE_PATH_TYPE, 'smoothstep')

  // 连接线颜色（空字符串 = 主题默认）
  const edgeColor = useLocalStorage(StorageKey.FLOW_EDGE_COLOR, '')

  // 节点边框粗细 (1-5)
  const nodeBorderWidth = useLocalStorage(StorageKey.FLOW_NODE_BORDER_WIDTH, 2)

  // 节点圆角 (0-16, step 4)
  const nodeBorderRadius = useLocalStorage(StorageKey.FLOW_NODE_BORDER_RADIUS, 6)

  // 节点背景色（空字符串 = 主题默认）
  const nodeBgColor = useLocalStorage(StorageKey.FLOW_NODE_BG_COLOR, '')

  // 节点字体大小 (12-20, step 2)
  const nodeFontSize = useLocalStorage(StorageKey.FLOW_NODE_FONT_SIZE, 14)

  // 节点连接点大小 (4-10, step 2)
  const nodeHandleSize = useLocalStorage(StorageKey.FLOW_NODE_HANDLE_SIZE, 6)

  // 更新连接线粗细
  const setEdgeStrokeWidth = (width: number) => {
    edgeStrokeWidth.value = Math.max(1, Math.min(5, width))
  }

  // 切换连接线起点箭头
  const toggleEdgeMarkerStart = () => {
    edgeMarkerStart.value = !edgeMarkerStart.value
  }

  // 切换连接线终点箭头
  const toggleEdgeMarkerEnd = () => {
    edgeMarkerEnd.value = !edgeMarkerEnd.value
  }

  // 切换连接线动画
  const toggleEdgeAnimated = () => {
    edgeAnimated.value = !edgeAnimated.value
  }

  // 设置连接线线型
  const setEdgeStrokeType = (type: FlowEdgeStrokeType) => {
    edgeStrokeType.value = type
  }

  // 设置连接线路径类型
  const setEdgePathType = (type: FlowEdgePathType) => {
    edgePathType.value = type
  }

  // 设置连接线颜色
  const setEdgeColor = (color: string) => {
    edgeColor.value = color
  }

  // 更新节点边框粗细
  const setNodeBorderWidth = (width: number) => {
    nodeBorderWidth.value = Math.max(1, Math.min(5, width))
  }

  // 设置节点圆角
  const setNodeBorderRadius = (radius: number) => {
    nodeBorderRadius.value = Math.max(0, Math.min(16, radius))
  }

  // 设置节点背景色
  const setNodeBgColor = (color: string) => {
    nodeBgColor.value = color
  }

  // 设置节点字体大小
  const setNodeFontSize = (size: number) => {
    nodeFontSize.value = Math.max(12, Math.min(20, size))
  }

  // 设置节点连接点大小
  const setNodeHandleSize = (size: number) => {
    nodeHandleSize.value = Math.max(4, Math.min(10, size))
  }

  return {
    // 状态
    edgeStrokeWidth,
    edgeMarkerStart,
    edgeMarkerEnd,
    edgeAnimated,
    edgeStrokeType,
    edgePathType,
    edgeColor,
    nodeBorderWidth,
    nodeBorderRadius,
    nodeBgColor,
    nodeFontSize,
    nodeHandleSize,

    // 方法
    setEdgeStrokeWidth,
    toggleEdgeMarkerStart,
    toggleEdgeMarkerEnd,
    toggleEdgeAnimated,
    setEdgeStrokeType,
    setEdgePathType,
    setEdgeColor,
    setNodeBorderWidth,
    setNodeBorderRadius,
    setNodeBgColor,
    setNodeFontSize,
    setNodeHandleSize
  }
}
