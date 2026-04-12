<script setup lang="ts">
import { ref, computed, provide, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { VueFlow, useVueFlow, Panel, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { Flow, FlowMousePosition, UseFlowResizeDimensions, FlowNode as FlowNodeType } from '#v/types'
import { FLOW_MOUSE_POSITION_KEY } from '#v/constants'
import FlowNode from './FlowNode.client.vue'
import FlowEdge from './FlowEdge.client.vue'
import FlowToolbar from './FlowToolbar.vue'
import FlowStats from './FlowStats.vue'
import type { ResizeEdge } from '#v/composables'
import { useFlow, useFlowResize, useFlowStyles } from '#v/composables'

const props = withDefaults(defineProps<{
  /** Flow 数据模型 (v-model) */
  modelValue?: Flow
  /** 是否显示背景网格 */
  showBackground?: boolean
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示统计面板 */
  showStats?: boolean
  /** 最小缩放 */
  minZoom?: number
  /** 最大缩放 */
  maxZoom?: number
  /** 默认缩放 */
  defaultZoom?: number
}>(), {
  modelValue: () => ({ nodes: [], edges: [] }),
  showBackground: true,
  showToolbar: true,
  showStats: true,
  minZoom: 0.2,
  maxZoom: 4,
  defaultZoom: 1
})

const emit = defineEmits<{
  /** 数据模型更新 */
  'update:modelValue': [value: Flow]
  /** 双击节点时触发，由使用者自行处理编辑逻辑 */
  'edit-node': [node: FlowNodeType]
}>()

// 使用业务逻辑 composable
const handleUpdateModel = (model: Flow) => {
  emit('update:modelValue', model)
}

const flowLogic = useFlow({
  flow: computed(() => props.modelValue),
  onUpdateModel: computed(() => handleUpdateModel)
})

const {
  nodes,
  edges,
  GRID_SIZE,
  deleteNode,
  deleteEdge,
  createEdge,
  updateNodePosition,
  updateNodeDimensions,
  createNode,
  updateEdgeLabel
} = flowLogic

// 样式设置
const flowStyles = useFlowStyles()
const {
  edgeStrokeWidth,
  edgeMarkerStart,
  edgeMarkerEnd,
  nodeBorderWidth,
  setEdgeStrokeWidth,
  toggleEdgeMarkerStart,
  toggleEdgeMarkerEnd,
  setNodeBorderWidth
} = flowStyles

// VueFlow 实例
const { onConnect, onNodeDragStop, onEdgeUpdate, getSelectedNodes, getSelectedEdges, getViewport } = useVueFlow()

// Resize 功能
const handleResizeEnd = (nodeId: string, dimensions: UseFlowResizeDimensions) => {
  updateNodeDimensions(nodeId, dimensions)
}

const resizeLogic = useFlowResize({
  gridSize: GRID_SIZE,
  nodes,
  getViewport,
  onResizeEnd: handleResizeEnd
})

const {
  startResize,
  handleMouseMove,
  handleMouseUp
} = resizeLogic

// 共享鼠标位置（通过 provide/inject 传递给子组件，避免每个 FlowNode 都添加独立的 mousemove 监听）
const mousePosition = ref<FlowMousePosition>({ x: 0, y: 0 })
provide(FLOW_MOUSE_POSITION_KEY, mousePosition)

// 处理节点编辑（双击）
const handleEditNode = (nodeId: string) => {
  const flowNode = props.modelValue?.nodes?.find(n => String(n.id) === nodeId)
  if (flowNode) {
    emit('edit-node', flowNode)
  }
}

// 同步节点数据，添加事件处理器和样式
watchEffect(() => {
  flowLogic.syncNodes(nodeId => ({
    onEdit: () => handleEditNode(nodeId),
    onDelete: () => deleteNode(nodeId),
    borderWidth: nodeBorderWidth.value,
    onResizeStart: (event: MouseEvent, edge: ResizeEdge) => {
      const node = props.modelValue?.nodes?.find(n => String(n.id) === nodeId)
      if (node) {
        startResize(event, nodeId, node, edge)
      }
    }
  }))
})

// 同步边的样式（在初始化和样式变化时）
watchEffect(() => {
  edges.value.forEach((edge) => {
    edge.style = { strokeWidth: edgeStrokeWidth.value }
    edge.markerStart = edgeMarkerStart.value ? MarkerType.Arrow : undefined
    edge.markerEnd = edgeMarkerEnd.value ? MarkerType.Arrow : undefined
  })
})

// 同步边的事件处理器
watchEffect(() => {
  flowLogic.syncEdges(edgeId => ({
    onUpdateLabel: (newLabel: string) => updateEdgeLabel(edgeId, newLabel)
  }))
})

// 检查是否为删除键
const isDeleteKey = (event: KeyboardEvent) => {
  return event.key === 'Delete' || event.key === 'Backspace' || event.code === 'Backspace'
}

// 键盘事件处理
const handleKeyDown = async (event: KeyboardEvent) => {
  if (!isDeleteKey(event)) return

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  const selectedNodes = getSelectedNodes.value
  const selectedEdges = getSelectedEdges.value

  if (selectedNodes.length === 0 && selectedEdges.length === 0) return

  await Promise.all([
    ...selectedNodes.map(node => deleteNode(node.id)),
    ...selectedEdges.map(edge => deleteEdge(edge.id))
  ])
}

// 生命周期钩子
onMounted(() => {
  // 合并鼠标移动处理：更新共享位置 + 处理 resize 逻辑
  const handleGlobalMouseMove = (event: MouseEvent) => {
    mousePosition.value = { x: event.clientX, y: event.clientY }
    handleMouseMove(event)
  }

  document.addEventListener('keydown', handleKeyDown, true)
  window.addEventListener('mousemove', handleGlobalMouseMove)
  window.addEventListener('mouseup', handleMouseUp)

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown, true)
    window.removeEventListener('mousemove', handleGlobalMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  })
})

// 节点拖动结束
onNodeDragStop(async (event) => {
  const { node } = event
  await updateNodePosition(node.id, node.position.x, node.position.y)
})

// 连接节点
onConnect(async (params) => {
  await createEdge(params)
})

// Edge reconnect：拖拽边端点到新 handle 时触发（onEdgeUpdate 提供 connection）
onEdgeUpdate(({ edge, connection }) => {
  deleteEdge(edge.id)
  if (connection.source && connection.target) {
    createEdge(connection)
  }
})

// 边的默认样式配置
const defaultEdgeOptions = computed(() => ({
  style: {
    strokeWidth: edgeStrokeWidth.value
  },
  markerStart: edgeMarkerStart.value ? MarkerType.Arrow : undefined,
  markerEnd: edgeMarkerEnd.value ? MarkerType.Arrow : undefined
}))

// 允许任意连接
const isValidConnection = () => true
</script>

<template>
  <VueFlow
    v-model:nodes="nodes"
    v-model:edges="edges"
    :default-zoom="defaultZoom"
    :min-zoom="minZoom"
    :max-zoom="maxZoom"
    :snap-to-grid="true"
    :snap-grid="[GRID_SIZE, GRID_SIZE]"
    :default-edge-options="defaultEdgeOptions"
    :is-valid-connection="isValidConnection"
    :edges-updatable="true"
  >
    <Background
      v-if="showBackground"
      pattern-color="var(--ui-bg-elevated)"
      :gap="GRID_SIZE"
      variant="lines"
    />

    <template #node-custom="nodeProps">
      <FlowNode v-bind="nodeProps" />
    </template>

    <template #edge-custom="edgeProps">
      <FlowEdge v-bind="edgeProps" />
    </template>

    <Panel v-if="showToolbar" position="bottom-center">
      <FlowToolbar
        :on-add-node="createNode"
        :edge-stroke-width="edgeStrokeWidth"
        :edge-marker-start="edgeMarkerStart"
        :edge-marker-end="edgeMarkerEnd"
        :node-border-width="nodeBorderWidth"
        :on-edge-stroke-width-change="setEdgeStrokeWidth"
        :on-toggle-edge-marker-start="toggleEdgeMarkerStart"
        :on-toggle-edge-marker-end="toggleEdgeMarkerEnd"
        :on-node-border-width-change="setNodeBorderWidth"
      />
    </Panel>

    <Panel v-if="showStats" position="top-right">
      <FlowStats :node-count="nodes.length" :edge-count="edges.length" />
    </Panel>

    <!-- 透传额外的 Panel 插槽 -->
    <slot />
  </VueFlow>
</template>

<style>
/* Vue Flow 基础样式 */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
