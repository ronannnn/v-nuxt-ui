import { Position } from '@vue-flow/core'
import type { InjectionKey, Ref } from 'vue'
import type { FlowMousePosition } from '#v/types'

export type HandlePosition
  = | 'tl' | 'tr' | 'bl' | 'br' // 4 corners
    | 't1' | 't2' | 't3' // top edge
    | 'r1' | 'r2' | 'r3' // right edge
    | 'b1' | 'b2' | 'b3' // bottom edge
    | 'l1' | 'l2' | 'l3' // left edge

export type ResizeDirection = 'horizontal' | 'vertical' | 'both'

export interface FlowHandle {
  id: HandlePosition
  position: Position
  offsetPercent?: { x?: number, y?: number }
}

/**
 * 鼠标位置注入 Key
 */
export const FLOW_MOUSE_POSITION_KEY: InjectionKey<Ref<FlowMousePosition>> = Symbol('flow-mouse-position')

// 定义16个固定连接点位置
export const FLOW_HANDLES: FlowHandle[] = [
  // 4个角 - 可以双向调整
  { id: 'tl', position: Position.Top, offsetPercent: { x: 0 } },
  { id: 'tr', position: Position.Top, offsetPercent: { x: 100 } },
  { id: 'bl', position: Position.Bottom, offsetPercent: { x: 0 } },
  { id: 'br', position: Position.Bottom, offsetPercent: { x: 100 } },

  // top边3个点 - 只能垂直调整
  { id: 't1', position: Position.Top, offsetPercent: { x: 25 } },
  { id: 't2', position: Position.Top, offsetPercent: { x: 50 } },
  { id: 't3', position: Position.Top, offsetPercent: { x: 75 } },

  // right边3个点 - 只能水平调整
  { id: 'r1', position: Position.Right, offsetPercent: { y: 25 } },
  { id: 'r2', position: Position.Right, offsetPercent: { y: 50 } },
  { id: 'r3', position: Position.Right, offsetPercent: { y: 75 } },

  // bottom边3个点 - 只能垂直调整
  { id: 'b1', position: Position.Bottom, offsetPercent: { x: 25 } },
  { id: 'b2', position: Position.Bottom, offsetPercent: { x: 50 } },
  { id: 'b3', position: Position.Bottom, offsetPercent: { x: 75 } },

  // left边3个点 - 只能水平调整
  { id: 'l1', position: Position.Left, offsetPercent: { y: 25 } },
  { id: 'l2', position: Position.Left, offsetPercent: { y: 50 } },
  { id: 'l3', position: Position.Left, offsetPercent: { y: 75 } }
]

/**
 * Handle 层级阈值（可配置）
 */
export const FLOW_HANDLE_TIER_THRESHOLDS = {
  small: { maxWidth: 80, maxHeight: 40 },
  medium: { maxWidth: 160, maxHeight: 80 },
} as const

/**
 * Small 层级：每边中心各 1 个 = 4 个
 */
export const FLOW_HANDLES_SMALL: FlowHandle[] = FLOW_HANDLES.filter(h =>
  ['t2', 'r2', 'b2', 'l2'].includes(h.id)
)

/**
 * Medium 层级：4 中心 + 4 角 = 8 个
 */
export const FLOW_HANDLES_MEDIUM: FlowHandle[] = FLOW_HANDLES.filter(h =>
  ['t2', 'r2', 'b2', 'l2', 'tl', 'tr', 'bl', 'br'].includes(h.id)
)

/**
 * 连接线线型
 */
export type FlowEdgeStrokeType = 'solid' | 'dashed' | 'dotted' | 'dashdot'

export interface FlowEdgeStrokeOption {
  type: FlowEdgeStrokeType
  label: string
  dasharray: string
}

export const FLOW_EDGE_STROKE_TYPES: FlowEdgeStrokeOption[] = [
  { type: 'solid', label: '实线', dasharray: '' },
  { type: 'dashed', label: '虚线', dasharray: '8 4' },
  { type: 'dotted', label: '点线', dasharray: '2 4' },
  { type: 'dashdot', label: '点划线', dasharray: '8 4 2 4' },
]

/**
 * 连接线路径类型
 */
export type FlowEdgePathType = 'smoothstep' | 'bezier' | 'step' | 'straight'

export interface FlowEdgePathOption {
  type: FlowEdgePathType
  label: string
}

export const FLOW_EDGE_PATH_TYPES: FlowEdgePathOption[] = [
  { type: 'smoothstep', label: '平滑' },
  { type: 'bezier', label: '曲线' },
  { type: 'step', label: '直角' },
  { type: 'straight', label: '直线' },
]

/**
 * 连接线颜色预设
 */
export interface FlowEdgeColorOption {
  color: string // CSS color value, empty string = theme default
  label: string
}

export const FLOW_EDGE_COLORS: FlowEdgeColorOption[] = [
  { color: '', label: '默认' },
  { color: '#ef4444', label: '红' },
  { color: '#f97316', label: '橙' },
  { color: '#eab308', label: '黄' },
  { color: '#22c55e', label: '绿' },
  { color: '#3b82f6', label: '蓝' },
  { color: '#8b5cf6', label: '紫' },
  { color: '#6b7280', label: '灰' },
]
