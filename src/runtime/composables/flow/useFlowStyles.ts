import { computed } from 'vue'
import type { WritableComputedRef } from 'vue'
import { StorageKey } from '#v/types'
import { useLocalStorage } from '@vueuse/core'
import type { FlowEdgeStrokeType, FlowEdgePathType } from '#v/constants'

/** 连接线样式存储结构 */
export interface FlowEdgeStylesState {
  strokeWidth: number
  markerStart: boolean
  markerEnd: boolean
  animated: boolean
  strokeType: FlowEdgeStrokeType
  pathType: FlowEdgePathType
  color: string
}

/** 节点样式存储结构 */
export interface FlowNodeStylesState {
  borderWidth: number
  borderRadius: number
  bgColor: string
  fontSize: number
  handleSize: number
}

const EDGE_DEFAULTS: FlowEdgeStylesState = {
  strokeWidth: 2,
  markerStart: false,
  markerEnd: true,
  animated: false,
  strokeType: 'solid',
  pathType: 'smoothstep',
  color: ''
}

const NODE_DEFAULTS: FlowNodeStylesState = {
  borderWidth: 2,
  borderRadius: 6,
  bgColor: '',
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

  // 节点
  const nodeBorderWidth = useField(nodeStore, 'borderWidth')
  const nodeBorderRadius = useField(nodeStore, 'borderRadius')
  const nodeBgColor = useField(nodeStore, 'bgColor')
  const nodeFontSize = useField(nodeStore, 'fontSize')
  const nodeHandleSize = useField(nodeStore, 'handleSize')

  return {
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
    nodeHandleSize
  }
}
