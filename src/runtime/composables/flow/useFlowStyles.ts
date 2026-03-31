import { StorageKey } from '#v/types'
import { useLocalStorage } from '@vueuse/core'

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

  // 节点边框粗细 (1-5)
  const nodeBorderWidth = useLocalStorage(StorageKey.FLOW_NODE_BORDER_WIDTH, 2)

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

  // 更新节点边框粗细
  const setNodeBorderWidth = (width: number) => {
    nodeBorderWidth.value = Math.max(1, Math.min(5, width))
  }

  return {
    // 状态
    edgeStrokeWidth,
    edgeMarkerStart,
    edgeMarkerEnd,
    nodeBorderWidth,

    // 方法
    setEdgeStrokeWidth,
    toggleEdgeMarkerStart,
    toggleEdgeMarkerEnd,
    setNodeBorderWidth
  }
}
