import { computed, ref } from 'vue'
import type { WritableComputedRef } from 'vue'
import { StorageKey } from '#v/types'
import { useLocalStorage } from '@vueuse/core'
import type { FlowEdgeStrokeType, FlowEdgePathType, FlowArrowType } from '#v/constants'

/** 连接线样式存储结构 */
export interface FlowEdgeStylesState {
  strokeWidth: number
  markerStart: FlowArrowType
  markerEnd: FlowArrowType
  animated: boolean
  strokeType: FlowEdgeStrokeType
  pathType: FlowEdgePathType
  color: string
  labelColor: string
}

/** 节点样式存储结构 */
export interface FlowNodeStylesState {
  borderWidth: number
  borderRadius: number
  borderColor: string
  bgColor: string
  fontColor: string
  fontSize: number
  handleSize: number
}

const EDGE_DEFAULTS: FlowEdgeStylesState = {
  strokeWidth: 2,
  markerStart: 'none',
  markerEnd: 'arrow',
  animated: false,
  strokeType: 'solid',
  pathType: 'smoothstep',
  color: '',
  labelColor: ''
}

const NODE_DEFAULTS: FlowNodeStylesState = {
  borderWidth: 2,
  borderRadius: 6,
  borderColor: '',
  bgColor: '',
  fontColor: '',
  fontSize: 14,
  handleSize: 6
}

/** 从对象型 localStorage 中派生单个字段的可写 computed */
function useField<T extends Record<string, any>, K extends keyof T>(
  source: ReturnType<typeof useLocalStorage<T>>,
  key: K
): WritableComputedRef<T[K]> {
  return computed({
    get: () => source.value[key],
    set: (val: T[K]) => {
      source.value = { ...source.value, [key]: val }
    }
  })
}

/** 连接点大小预览标记（全局共享，改变 handleSize 后临时显示所有 handles） */
const _handleSizePreview = ref(false)
let _handleSizePreviewTimer: ReturnType<typeof setTimeout> | null = null

export const handleSizePreview = _handleSizePreview as Readonly<typeof _handleSizePreview>

function triggerHandleSizePreview() {
  if (_handleSizePreviewTimer) clearTimeout(_handleSizePreviewTimer)
  _handleSizePreview.value = true
  _handleSizePreviewTimer = setTimeout(() => {
    _handleSizePreview.value = false
    _handleSizePreviewTimer = null
  }, 1000)
}

/**
 * Flow 样式设置 Composable
 * localStorage 以对象形式存储，返回各字段的可写 computed ref
 */
export function useFlowStyles() {
  const edgeStore = useLocalStorage<FlowEdgeStylesState>(
    StorageKey.FLOW_EDGE_STYLES,
    { ...EDGE_DEFAULTS },
    { mergeDefaults: true }
  )

  const nodeStore = useLocalStorage<FlowNodeStylesState>(
    StorageKey.FLOW_NODE_STYLES,
    { ...NODE_DEFAULTS },
    { mergeDefaults: true }
  )

  // 连接线
  const edgeStrokeWidth = useField(edgeStore, 'strokeWidth')
  const edgeMarkerStart = useField(edgeStore, 'markerStart')
  const edgeMarkerEnd = useField(edgeStore, 'markerEnd')
  const edgeAnimated = useField(edgeStore, 'animated')
  const edgeStrokeType = useField(edgeStore, 'strokeType')
  const edgePathType = useField(edgeStore, 'pathType')
  const edgeColor = useField(edgeStore, 'color')
  const edgeLabelColor = useField(edgeStore, 'labelColor')

  // 节点
  const nodeBorderWidth = useField(nodeStore, 'borderWidth')
  const nodeBorderRadius = useField(nodeStore, 'borderRadius')
  const nodeBorderColor = useField(nodeStore, 'borderColor')
  const nodeBgColor = useField(nodeStore, 'bgColor')
  const nodeFontColor = useField(nodeStore, 'fontColor')
  const nodeFontSize = useField(nodeStore, 'fontSize')
  const _nodeHandleSize = useField(nodeStore, 'handleSize')

  // 包装 handleSize，set 时触发预览
  const nodeHandleSize = computed({
    get: () => _nodeHandleSize.value,
    set: (val: number) => {
      _nodeHandleSize.value = val
      triggerHandleSizePreview()
    }
  })

  return {
    edgeStrokeWidth,
    edgeMarkerStart,
    edgeMarkerEnd,
    edgeAnimated,
    edgeStrokeType,
    edgePathType,
    edgeColor,
    edgeLabelColor,
    nodeBorderWidth,
    nodeBorderRadius,
    nodeBorderColor,
    nodeBgColor,
    nodeFontColor,
    nodeFontSize,
    nodeHandleSize
  }
}
