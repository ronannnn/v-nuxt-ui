<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useFlowStyles } from '#v/composables/flow/useFlowStyles'
import { EdgeLabelRenderer, getSmoothStepPath, getBezierPath, getStraightPath, BaseEdge } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const flowStyles = useFlowStyles()
const { edgeMarkerStart, edgeMarkerEnd, edgePathType, edgeColor } = flowStyles

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

const customMarkerEnd = computed(() => edgeMarkerEnd.value ? `url(#custom-arrow-end-${props.id})` : undefined)
const customMarkerStart = computed(() => edgeMarkerStart.value ? `url(#custom-arrow-start-${props.id})` : undefined)

const strokeColor = computed(() => {
  if (props.selected) return 'var(--ui-primary)'
  return edgeColor.value || 'var(--ui-text-dimmed)'
})

const edgeStyle = computed(() => ({
  ...props.style,
  stroke: strokeColor.value
}))

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
</script>

<template>
  <svg style="position: absolute; width: 0; height: 0">
    <defs>
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
        class="bg-background border border-default rounded px-2 py-1 text-xs outline-none"
        style="min-width: 40px; width: auto;"
        @keydown.enter="saveLabel"
        @keydown.escape="cancelEditing"
        @blur="saveLabel"
      >
      <!-- Display mode: show label or invisible placeholder for no-label edges -->
      <div
        v-else-if="label"
        class="bg-background border border-default rounded px-2 py-1 text-xs shadow-sm"
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
