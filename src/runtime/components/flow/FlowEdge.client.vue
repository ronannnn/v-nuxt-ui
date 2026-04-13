<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useFlowStyles } from '#v/composables/flow/useFlowStyles'
import { FLOW_EDGE_STROKE_TYPES } from '#v/constants'
import type { FlowArrowType } from '#v/constants'
import { EdgeLabelRenderer, getSmoothStepPath, getBezierPath, getStraightPath, BaseEdge } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const {
  edgeMarkerStart,
  edgeMarkerEnd,
  edgePathType,
  edgeAnimated,
  edgeStrokeType,
  effectiveEdgeColor,
  effectiveEdgeLabelColor,
  effectiveNodeBorderColor
} = useFlowStyles()

const path = computed(() => {
  switch (edgePathType.value) {
    case 'bezier':
      return getBezierPath(props)
    case 'step':
      return getSmoothStepPath({ ...props, borderRadius: 0 })
    case 'straight':
      return getStraightPath(props)
    case 'smoothstep':
    default:
      return getSmoothStepPath(props)
  }
})

/** 根据箭头类型和方向生成 marker URL */
function markerUrl(type: FlowArrowType, direction: 'start' | 'end'): string | undefined {
  if (type === 'none') return undefined
  return `url(#marker-${type}-${direction}-${props.id})`
}

const customMarkerEnd = computed(() => markerUrl(edgeMarkerEnd.value, 'end'))
const customMarkerStart = computed(() => markerUrl(edgeMarkerStart.value, 'start'))

const strokeColor = computed(() => {
  if (props.selected) return 'var(--ui-primary)'
  return effectiveEdgeColor.value || 'var(--ui-text-dimmed)'
})

/** Marker 配置表：每种箭头类型对应的 SVG 属性 */
interface MarkerDef {
  viewBox: string
  refX: number
  refY: number
  /** SVG path/shape 的 d 属性或元素类型 */
  shape: 'path' | 'circle'
  d?: string
  cx?: number
  cy?: number
  r?: number
  filled: boolean
}

const MARKER_DEFS: Record<Exclude<FlowArrowType, 'none'>, { end: MarkerDef, start: MarkerDef }> = {
  'arrow': {
    // end: tip at (10,5); refX=8 → line ends 2px inside triangle, stroke fully covered by fill
    end: { viewBox: '-1 -1 12 12', refX: 8, refY: 5, shape: 'path', d: 'M 0 0 L 10 5 L 0 10 z', filled: true },
    // start: tip at (0,5); refX=2 → line ends 2px inside triangle, stroke fully covered by fill
    start: { viewBox: '-1 -1 12 12', refX: 2, refY: 5, shape: 'path', d: 'M 10 0 L 0 5 L 10 10 z', filled: true }
  },
  'diamond': {
    // end: rightmost at x=12; refX=10 → line ends 2px inside diamond
    end: { viewBox: '-2 -2 16 12', refX: 10, refY: 4, shape: 'path', d: 'M 0 4 L 6 0 L 12 4 L 6 8 z', filled: true },
    // start: leftmost at x=0; refX=2 → line ends 2px inside diamond
    start: { viewBox: '-2 -2 16 12', refX: 2, refY: 4, shape: 'path', d: 'M 0 4 L 6 0 L 12 4 L 6 8 z', filled: true }
  },
  'diamond-open': {
    end: { viewBox: '-2 -2 16 12', refX: 10, refY: 4, shape: 'path', d: 'M 0 4 L 6 0 L 12 4 L 6 8 z', filled: false },
    start: { viewBox: '-2 -2 16 12', refX: 2, refY: 4, shape: 'path', d: 'M 0 4 L 6 0 L 12 4 L 6 8 z', filled: false }
  },
  'circle': {
    // end: right edge at x=8; refX=6 → line ends 2px inside circle
    end: { viewBox: '-2 -2 12 12', refX: 6, refY: 4, shape: 'circle', cx: 4, cy: 4, r: 4, filled: true },
    // start: left edge at x=0; refX=2 → line ends 2px inside circle
    start: { viewBox: '-2 -2 12 12', refX: 2, refY: 4, shape: 'circle', cx: 4, cy: 4, r: 4, filled: true }
  },
  'circle-open': {
    end: { viewBox: '-2 -2 12 12', refX: 6, refY: 4, shape: 'circle', cx: 4, cy: 4, r: 4, filled: false },
    start: { viewBox: '-2 -2 12 12', refX: 2, refY: 4, shape: 'circle', cx: 4, cy: 4, r: 4, filled: false }
  }
}

/** 需要渲染的 marker 列表 */
const markersToRender = computed(() => {
  const markers: Array<{ id: string, def: MarkerDef }> = []
  const startType = edgeMarkerStart.value
  const endType = edgeMarkerEnd.value

  if (startType !== 'none') {
    const defs = MARKER_DEFS[startType]
    markers.push({ id: `marker-${startType}-start-${props.id}`, def: defs.start })
  }
  if (endType !== 'none') {
    const defs = MARKER_DEFS[endType]
    markers.push({ id: `marker-${endType}-end-${props.id}`, def: defs.end })
  }
  return markers
})

const edgeStyle = computed(() => {
  const base: Record<string, any> = {
    ...props.style,
    stroke: strokeColor.value
  }

  if (edgeAnimated.value) {
    const strokeOpt = FLOW_EDGE_STROKE_TYPES.find(t => t.type === edgeStrokeType.value)
    const dasharray = strokeOpt?.dasharray || ''
    // solid 用 '8 4' 做流动效果，非实线用原有 dasharray
    const animDash = dasharray || '8 4'
    const total = animDash.split(/\s+/).reduce((sum, n) => sum + Number(n), 0)

    base.strokeDasharray = animDash
    // 使用 CSS 自定义属性传递 dashoffset 值给 keyframes
    base['--flow-dash-len'] = `${total}`
    base.animation = `flow-dash ${Math.max(total * 0.05, 0.3)}s linear infinite`
  }

  return base
})

// Label editing state
const editingLabel = ref(false)
const tempLabel = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const startEditing = () => {
  editingLabel.value = true
  tempLabel.value = typeof props.label === 'string' ? props.label : ''
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

const saveLabel = () => {
  if (!editingLabel.value) return
  editingLabel.value = false
  const newLabel = tempLabel.value.trim()
  props.data?.onUpdateLabel?.(newLabel)
}

const cancelEditing = () => {
  editingLabel.value = false
}

const labelColorStyle = computed(() => effectiveEdgeLabelColor.value ? { color: effectiveEdgeLabelColor.value } : {})
const labelBorderColorStyle = computed(() => effectiveNodeBorderColor.value ? { borderColor: effectiveNodeBorderColor.value } : {})
</script>

<template>
  <svg style="position: absolute; width: 0; height: 0">
    <defs>
      <marker
        v-for="m in markersToRender"
        :id="m.id"
        :key="m.id"
        :viewBox="m.def.viewBox"
        :refX="m.def.refX"
        :refY="m.def.refY"
        markerWidth="12"
        markerHeight="12"
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <path
          v-if="m.def.shape === 'path'"
          :d="m.def.d"
          :fill="m.def.filled ? strokeColor : 'var(--ui-bg)'"
          :stroke="strokeColor"
          :stroke-width="m.def.filled ? 0 : 1.5"
        />
        <circle
          v-else-if="m.def.shape === 'circle'"
          :cx="m.def.cx"
          :cy="m.def.cy"
          :r="m.def.r"
          :fill="m.def.filled ? strokeColor : 'var(--ui-bg)'"
          :stroke="strokeColor"
          :stroke-width="m.def.filled ? 0 : 1.5"
        />
      </marker>
    </defs>
  </svg>

  <BaseEdge
    :id="id"
    :style="edgeStyle"
    :path="path[0]"
    :marker-end="customMarkerEnd"
    :marker-start="customMarkerStart"
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        pointerEvents: 'all'
      }"
      class="nodrag nopan"
      @dblclick.stop="startEditing"
    >
      <!-- Editing mode -->
      <input
        v-if="editingLabel"
        ref="inputRef"
        v-model="tempLabel"
        class="bg-default border border-default rounded px-2 py-1 text-xs outline-none"
        :style="{ minWidth: '16px', ...labelColorStyle }"
        @keydown.enter="saveLabel"
        @keydown.escape="cancelEditing"
        @blur="saveLabel"
      >
      <!-- Display mode: show label or invisible placeholder for no-label edges -->
      <div
        v-else-if="label"
        class="bg-default border border-default rounded px-2 py-1 text-xs shadow-sm"
        :style="{
          ...labelColorStyle,
          ...labelBorderColorStyle
        }"
      >
        {{ label }}
      </div>
      <!-- Invisible placeholder for edges without label -->
      <div
        v-else
        class="w-6 h-4 opacity-0 hover:opacity-30 hover:bg-muted rounded transition-opacity"
      />
    </div>
  </EdgeLabelRenderer>
</template>

<style>
@keyframes flow-dash {
  to {
    stroke-dashoffset: calc(var(--flow-dash-len) * -1px);
  }
}
</style>
