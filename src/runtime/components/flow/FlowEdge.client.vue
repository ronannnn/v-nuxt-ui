<script setup lang="ts">
import { computed } from 'vue'
import { useFlowStyles } from '#v/composables/flow/useFlowStyles'
import { EdgeLabelRenderer, getSmoothStepPath, BaseEdge } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const path = computed(() => getSmoothStepPath(props))

// 使用全局样式配置
const flowStyles = useFlowStyles()
const { edgeMarkerStart, edgeMarkerEnd } = flowStyles

// 自定义 marker ID - 只有在全局设置启用时才显示
const customMarkerEnd = computed(() => edgeMarkerEnd.value ? `url(#custom-arrow-end-${props.id})` : undefined)
const customMarkerStart = computed(() => edgeMarkerStart.value ? `url(#custom-arrow-start-${props.id})` : undefined)

// 根据选中状态设置颜色
const strokeColor = computed(() =>
  props.selected ? 'var(--ui-primary)' : 'var(--ui-text-dimmed)'
)

// 合并样式，添加颜色
const edgeStyle = computed(() => ({
  ...props.style,
  stroke: strokeColor.value
}))
</script>

<template>
  <svg style="position: absolute; width: 0; height: 0">
    <defs>
      <!-- 自定义箭头 - 终点 -->
      <marker
        :id="`custom-arrow-end-${id}`"
        viewBox="-4 -4 14 18"
        refX="7"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path
          d="M -4 -4 L 10 5 L -4 14 z"
          :fill="strokeColor"
        />
      </marker>

      <!-- 自定义箭头 - 起点 -->
      <marker
        :id="`custom-arrow-start-${id}`"
        viewBox="0 -4 14 18"
        refX="3"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto"
      >
        <path
          d="M 14 -4 L 0 5 L 14 14 z"
          :fill="strokeColor"
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
      v-if="label"
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        pointerEvents: 'all'
      }"
      class="nodrag nopan"
    >
      <div class="bg-background border border-default rounded px-2 py-1 text-xs shadow-sm">
        {{ label }}
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
