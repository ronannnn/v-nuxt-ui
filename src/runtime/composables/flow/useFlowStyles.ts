import { computed, ref } from 'vue'
import type { WritableComputedRef } from 'vue'
import { StorageKey } from '#v/types'
import { useLocalStorage } from '@vueuse/core'
import type { FlowEdgeStrokeType, FlowEdgePathType, FlowArrowType } from '#v/constants'
import { resolveUnifiedColor } from '#v/constants'

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
  handleColor: string
}

/** 颜色模式存储结构 */
export type FlowColorMode = 'unified' | 'custom'

export interface FlowColorModeState {
  /** 统一 / 自定义 */
  mode: FlowColorMode
  /** 统一模式下选中的 Tailwind 颜色名（例如 'blue'），空字符串 = 默认 */
  colorName: string
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
  handleSize: 6,
  handleColor: ''
}

const COLOR_MODE_DEFAULTS: FlowColorModeState = {
  mode: 'custom',
  colorName: ''
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

  const colorModeStore = useLocalStorage<FlowColorModeState>(
    StorageKey.FLOW_COLOR_MODE,
    { ...COLOR_MODE_DEFAULTS },
    { mergeDefaults: true }
  )

  // ---- 颜色模式 ----
  const colorMode = useField(colorModeStore, 'mode')
  const unifiedColor = useField(colorModeStore, 'colorName')
  const isUnifiedMode = computed(() => colorMode.value === 'unified')

  // 统一模式下按色阶派生的 CSS var（空名称 → 空字符串 → 主题默认色）
  const unifiedBorderColor = computed(() => resolveUnifiedColor(unifiedColor.value, 500))
  const unifiedBgColor = computed(() => resolveUnifiedColor(unifiedColor.value, 50))
  const unifiedFontColor = computed(() => resolveUnifiedColor(unifiedColor.value, 600))
  const unifiedHandleColor = computed(() => resolveUnifiedColor(unifiedColor.value, 500))
  const unifiedEdgeColor = computed(() => resolveUnifiedColor(unifiedColor.value, 500))
  const unifiedEdgeLabelColor = computed(() => resolveUnifiedColor(unifiedColor.value, 600))

  // 连接线（原始自定义值）
  const edgeStrokeWidth = useField(edgeStore, 'strokeWidth')
  const edgeMarkerStart = useField(edgeStore, 'markerStart')
  const edgeMarkerEnd = useField(edgeStore, 'markerEnd')
  const edgeAnimated = useField(edgeStore, 'animated')
  const edgeStrokeType = useField(edgeStore, 'strokeType')
  const edgePathType = useField(edgeStore, 'pathType')
  const edgeColor = useField(edgeStore, 'color')
  const edgeLabelColor = useField(edgeStore, 'labelColor')

  // 节点（原始自定义值）
  const nodeBorderWidth = useField(nodeStore, 'borderWidth')
  const nodeBorderRadius = useField(nodeStore, 'borderRadius')
  const nodeBorderColor = useField(nodeStore, 'borderColor')
  const nodeBgColor = useField(nodeStore, 'bgColor')
  const nodeFontColor = useField(nodeStore, 'fontColor')
  const nodeFontSize = useField(nodeStore, 'fontSize')
  const _nodeHandleSize = useField(nodeStore, 'handleSize')
  const _nodeHandleColor = useField(nodeStore, 'handleColor')

  // 包装 handleSize，set 时触发预览
  const nodeHandleSize = computed({
    get: () => _nodeHandleSize.value,
    set: (val: number) => {
      _nodeHandleSize.value = val
      triggerHandleSizePreview()
    }
  })
  const nodeHandleColor = computed({
    get: () => _nodeHandleColor.value,
    set: (val: string) => {
      _nodeHandleColor.value = val
      triggerHandleSizePreview()
    }
  })

  // ---- 有效颜色（统一模式优先，否则回退到自定义值） ----
  const effectiveNodeBorderColor = computed(() => isUnifiedMode.value ? unifiedBorderColor.value : nodeBorderColor.value)
  const effectiveNodeBgColor = computed(() => isUnifiedMode.value ? unifiedBgColor.value : nodeBgColor.value)
  const effectiveNodeFontColor = computed(() => isUnifiedMode.value ? unifiedFontColor.value : nodeFontColor.value)
  const effectiveNodeHandleColor = computed(() => isUnifiedMode.value ? unifiedHandleColor.value : nodeHandleColor.value)
  const effectiveEdgeColor = computed(() => isUnifiedMode.value ? unifiedEdgeColor.value : edgeColor.value)
  const effectiveEdgeLabelColor = computed(() => isUnifiedMode.value ? unifiedEdgeLabelColor.value : edgeLabelColor.value)

  return {
    // 颜色模式
    colorMode,
    unifiedColor,
    isUnifiedMode,

    // 连接线（原始自定义值，用于 UI 绑定）
    edgeStrokeWidth,
    edgeMarkerStart,
    edgeMarkerEnd,
    edgeAnimated,
    edgeStrokeType,
    edgePathType,
    edgeColor,
    edgeLabelColor,

    // 节点（原始自定义值，用于 UI 绑定）
    nodeBorderWidth,
    nodeBorderRadius,
    nodeBorderColor,
    nodeBgColor,
    nodeFontColor,
    nodeFontSize,
    nodeHandleSize,
    nodeHandleColor,

    // 有效颜色（统一 / 自定义 解析后，用于实际渲染）
    effectiveNodeBorderColor,
    effectiveNodeBgColor,
    effectiveNodeFontColor,
    effectiveNodeHandleColor,
    effectiveEdgeColor,
    effectiveEdgeLabelColor
  }
}
