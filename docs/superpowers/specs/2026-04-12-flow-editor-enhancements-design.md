# FlowEditor 增强设计 — 6 Issue Fix

## 概述

修复和增强 `FlowEditor.client.vue` 组件的 6 个问题：网格对齐、节点 resize、edge label 编辑、edge reconnect、动态 handle 数量、Flow API composable。

## Issue 1: 节点边框网格对齐

### 问题

节点使用 CSS content-box（默认），border 不包含在声明的宽高中。一个 `width: 128px` + `border: 2px` 的节点实际占位 132px，不对齐 GRID_SIZE=20px 网格。此外 128 本身也不是 20 的整数倍（128/20=6.4）。

### 方案

1. 节点根 div 添加 `box-sizing: border-box`，使 border 包含在声明的宽高中
2. 默认宽度从 128px 改为 **120px**（20×6），高度 40px 不变（20×2）
3. Resize 时 minWidth 和 minHeight 也对齐网格倍数

### 修改文件

- `FlowNode.client.vue` — 添加 `box-sizing: border-box`
- `useFlow.ts` — `createNode()` 默认 width: 128 → 120
- `useFlowResize.ts` — fallback width 128 → 120

---

## Issue 2: 节点 Resize 不工作

### 问题

`useFlowResize` 通过 `onMouseMove` + `detectEdge` 在节点内部检测边缘位置，但 VueFlow 的内部拖拽系统在 mousedown 时抢先接管，导致光标永远不变，resize 永远不触发。

### 方案：Overlay Resize Handles

在 `FlowNode.client.vue` 中添加 8 个绝对定位的不可见 div 作为 resize handle：

```
┌──[TL]────────[T]────────[TR]──┐
│                                │
[L]          content           [R]
│                                │
└──[BL]────────[B]────────[BR]──┘
```

- 4 条边 strip（8px 厚，除去角落部分）
- 4 个角区域（8×8px）
- 每个 div 设置 CSS `cursor` 属性（nwse-resize, ns-resize 等）
- `@mousedown.stop.prevent` 阻止 VueFlow 拖拽事件冒泡
- mousedown 时通过 `data.onResizeStart?.(event, edgeName)` 回调通知 FlowEditor
- FlowEditor 调用 `useFlowResize.startResize()`

### useFlowResize 简化

移除：
- `detectEdge()` — 不再需要 JS 边缘检测
- `getCursorForEdge()` — cursor 由 CSS 处理
- `createNodeHandlers()` — 用 `onResizeStart` 回调替代

保留：
- `startResize(event, nodeId, node, edge)` — 开始 resize
- `handleMouseMove(event)` — 处理拖拽中的尺寸计算（含网格对齐）
- `handleMouseUp()` — 结束 resize，触发 onResizeEnd
- `isResizing` — 状态标记

注意：`hoveredNodeId` 从 `useFlowResize` 移除。Handle 显示改为在 `FlowNode` 中使用自身的 `isHovered`（已有）和 `isNearby`（已有）computed 控制，不再依赖外部传入。

### 约束

- minWidth: 60px（20×3）
- minHeight: 40px（20×2）
- 所有尺寸对齐 GRID_SIZE

### 修改文件

- `FlowNode.client.vue` — 添加 8 个 resize handle div
- `useFlowResize.ts` — 简化，移除边缘检测逻辑
- `FlowEditor.client.vue` — `syncNodes` 中添加 `onResizeStart` 回调

---

## Issue 3: Edge Label 编辑

### 问题

`FlowEdge.client.vue` 的 label 是静态显示的 `{{ label }}`，无法编辑。

### 方案：双击原地编辑

**有 label 的 edge**:
1. 双击 label div → `editingLabel = true`
2. 渲染 `<input>` 替代 `{{ label }}`，自动 focus + 全选
3. Enter 或 blur → 保存：调用 `data.onUpdateLabel?.(newLabel)`
4. Escape → 取消，恢复原值

**没有 label 的 edge**:
1. 在 `FlowEdge` 中，始终渲染一个不可见的 label 占位区域（使用 `EdgeLabelRenderer` + 透明 div），位于 edge 路径中点
2. 双击该占位区域 → 进入编辑状态，显示空 input
3. 如果保存时 label 为空 → 移除 label（占位区域恢复不可见）

### 数据流

```
FlowEdge (@dblclick) 
  → data.onUpdateLabel(newLabel) 
  → FlowEditor.syncEdges() 中注入的回调
  → useFlow.updateEdgeLabel(edgeId, label) 
  → emitUpdate()
```

### Input 样式

匹配现有 label 样式：`bg-background border border-default rounded px-2 py-1 text-xs`，无额外 shadow。宽度 auto，min-width 40px。

### 新增方法

- `useFlow.ts` 新增 `updateEdgeLabel(edgeId: string, label: string): void`
- `FlowEditor.client.vue` 新增 `syncEdges()` watchEffect，类似 `syncNodes()`，为每条 edge 注入 `onUpdateLabel` 回调

### 修改文件

- `FlowEdge.client.vue` — 添加双击编辑逻辑
- `useFlow.ts` — 新增 `updateEdgeLabel` 方法 + `syncEdges`
- `FlowEditor.client.vue` — 调用 `syncEdges`，注入回调

---

## Issue 4: Edge Reconnect

### 问题

已有的箭头（edge）不能修改 source 或 target 的连接点。

### 方案：VueFlow 内置 edgesUpdatable

使用 VueFlow 的内置功能：

1. `<VueFlow>` 添加 `:edges-updatable="true"` prop
2. 用户拖动 edge 端点时，edge 跟随鼠标移动
3. 松开在有效连接点上 → 触发 `onEdgeUpdateEnd(event, edge, connection)`
4. 回调中：删除旧 edge，用新连接参数创建新 edge
5. 松开在空白处 → 自动回弹到原连接点（VueFlow 默认行为）

### 实现

```ts
// FlowEditor.client.vue
const { onEdgeUpdateEnd } = useVueFlow()

onEdgeUpdateEnd(({ edge, connection }) => {
  // 删除旧 edge
  deleteEdge(edge.id)
  // 创建新 edge
  if (connection.source && connection.target) {
    createEdge(connection)
  }
})
```

### 修改文件

- `FlowEditor.client.vue` — 添加 `edgesUpdatable` prop 和 `onEdgeUpdateEnd` 处理

---

## Issue 5: 动态 Handle 数量

### 问题

无论节点大小，始终显示全部 16 个 handle。小节点上 handle 密集重叠。

### 方案：3 层策略

| 层级 | 条件 | Handle 数 | 包含 |
|------|------|-----------|------|
| Small | width < 80 OR height < 40 | 4 | 每边中心各 1 |
| Medium | width < 160 OR height < 80 | 8 | 4 中心 + 4 角 |
| Large | 其他 | 16 | 全部 |

### 阈值配置

阈值作为可修改常量，便于后续调整：

```ts
// constants/flow.ts
export const FLOW_HANDLE_TIER_THRESHOLDS = {
  small: { maxWidth: 80, maxHeight: 40 },
  medium: { maxWidth: 160, maxHeight: 80 },
} as const
```

### Handle 子集定义

```ts
// constants/flow.ts
// Small: 每边中心 1 个 = 4 个
export const FLOW_HANDLES_SMALL = FLOW_HANDLES.filter(h =>
  ['t2', 'r2', 'b2', 'l2'].includes(h.id)
)
// Medium: 4 中心 + 4 角 = 8 个
export const FLOW_HANDLES_MEDIUM = FLOW_HANDLES.filter(h =>
  ['t2', 'r2', 'b2', 'l2', 'tl', 'tr', 'bl', 'br'].includes(h.id)
)
```

### FlowNode computed

```ts
const activeHandles = computed(() => {
  const w = props.data.width ?? 120
  const h = props.data.height ?? 40
  const t = FLOW_HANDLE_TIER_THRESHOLDS
  if (w < t.small.maxWidth || h < t.small.maxHeight) return FLOW_HANDLES_SMALL
  if (w < t.medium.maxWidth || h < t.medium.maxHeight) return FLOW_HANDLES_MEDIUM
  return FLOW_HANDLES
})
```

### 修改文件

- `constants/flow.ts` — 新增 `FLOW_HANDLE_TIER_THRESHOLDS`, `FLOW_HANDLES_SMALL`, `FLOW_HANDLES_MEDIUM`
- `FlowNode.client.vue` — `v-for="handle in activeHandles"` 替代 `FLOW_HANDLES`

---

## Issue 6: Flow API Composable

### 问题

缺少 Flow 的 API composable（类似 `useTableApi`）。

### 方案

完全遵循 `useTableApi` 模式：

```ts
// src/runtime/composables/api/useFlowApi.ts
import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import type { Flow } from '#v/types'

export const useFlowApi = createSharedComposable(() => useApi<Flow>('/flows'))
```

### 类型扩展

`Flow` 接口需要增加 API 所需字段：

```ts
export interface Flow {
  id?: number | string
  name?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}
```

`id` 和 `name` 为可选（创建时可能不存在）。

### 修改文件

- 新建 `src/runtime/composables/api/useFlowApi.ts`
- `src/runtime/composables/api/index.ts` — 导出 `useFlowApi`
- `src/runtime/types/components/flow.ts` — Flow 类型添加 `id`, `name` 字段

---

## 修改文件汇总

| 文件 | 涉及 Issue |
|------|-----------|
| `FlowNode.client.vue` | #1, #2, #5 |
| `FlowEdge.client.vue` | #3 |
| `FlowEditor.client.vue` | #2, #3, #4 |
| `useFlow.ts` | #1, #3 |
| `useFlowResize.ts` | #1, #2 |
| `constants/flow.ts` | #5 |
| `types/components/flow.ts` | #6 |
| `composables/api/useFlowApi.ts` (新建) | #6 |
| `composables/api/index.ts` | #6 |
