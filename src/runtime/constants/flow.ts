import { Position } from '@vue-flow/core'
import type { InjectionKey, Ref } from 'vue'
import type { FlowMousePosition } from '#v/types'

export const GRID_SIZE = 20

/**
 * Resize 边/角类型
 */
export type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

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
  medium: { maxWidth: 120, maxHeight: 80 }
} as const

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
  { type: 'dashdot', label: '点划线', dasharray: '8 4 2 4' }
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
  { type: 'straight', label: '直线' }
]

/**
 * 颜色选项（用于 CircleColor 选色器）
 * color 字段统一存储 Tailwind 颜色**名称**（如 'blue'），空字符串 = 主题默认色
 */
export interface FlowColorOption {
  /** Tailwind 颜色名，空字符串 = 主题默认色 */
  color: string
  /** 同 color，传给 CircleColor 的 chip prop */
  chip: string
}

/** 标准 Tailwind v4 primary 颜色名列表（17色，与 useTheme.primaryColors 一致） */
const FLOW_COLOR_NAMES = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink', 'rose'
] as const

/** 所有颜色选项（default + 17色），存的都是颜色名，不含 shade */
export const FLOW_COLORS: FlowColorOption[] = [
  { color: '', chip: '' },
  ...FLOW_COLOR_NAMES.map(name => ({ color: name, chip: name }))
]

/**
 * Light / Dark 模式下各用途的色阶映射
 *
 * | 用途         | light | dark |
 * |-------------|-------|------|
 * | bg (节点背景) |  50   | 950  |
 * | border/edge/handle | 500 | 400 |
 * | font/label  | 600   | 400  |
 */
export const FLOW_SHADE_MAP = {
  bg: { light: 50, dark: 950 },
  border: { light: 500, dark: 400 },
  font: { light: 600, dark: 400 }
} as const

export type FlowColorRole = keyof typeof FLOW_SHADE_MAP

/**
 * 根据颜色名、用途角色和 dark/light 模式生成 CSS var
 * 空名称返回空字符串（= 使用主题默认色）
 */
export function resolveFlowColor(name: string, role: FlowColorRole, isDark: boolean): string {
  if (!name) return ''
  const shade = FLOW_SHADE_MAP[role][isDark ? 'dark' : 'light']
  return `var(--color-${name}-${shade})`
}

/**
 * 箭头类型
 */
export type FlowArrowType = 'none' | 'arrow' | 'diamond' | 'diamond-open' | 'circle' | 'circle-open'

export interface FlowArrowOption {
  type: FlowArrowType
  label: string
}

export const FLOW_ARROW_TYPES: FlowArrowOption[] = [
  { type: 'none', label: '无' },
  { type: 'arrow', label: '三角实心' },
  { type: 'diamond', label: '菱形实心' },
  { type: 'diamond-open', label: '菱形空心' },
  { type: 'circle', label: '圆形实心' },
  { type: 'circle-open', label: '圆形空心' }
]

// ============================================================
// USelect items（直接用于 USelect :items 绑定，value 字段兼容）
// ============================================================

/** 粗细选项（连接线/边框通用） */
export const FLOW_WIDTH_ITEMS: { label: string, value: number }[] = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 }
]

/** 线型选项（带 dasharray 供 SVG 预览用） */
export const FLOW_STROKE_TYPE_ITEMS = FLOW_EDGE_STROKE_TYPES.map(o => ({
  label: o.label,
  value: o.type as FlowEdgeStrokeType,
  dasharray: o.dasharray
}))

/** 路径类型选项 */
export const FLOW_PATH_TYPE_ITEMS = FLOW_EDGE_PATH_TYPES.map(o => ({
  label: o.label,
  value: o.type as FlowEdgePathType
}))

/** 箭头类型选项 */
export const FLOW_ARROW_TYPE_ITEMS = FLOW_ARROW_TYPES.map(o => ({
  label: o.label,
  value: o.type as FlowArrowType
}))

/** 圆角选项 */
export const FLOW_BORDER_RADIUS_ITEMS: { label: string, value: number }[] = [
  { label: '0', value: 0 },
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: '6', value: 6 },
  { label: '8', value: 8 }
]

/** 字号选项 */
export const FLOW_FONT_SIZE_ITEMS: { label: string, value: number, twClass: string }[] = [
  { label: 'xs', value: 12, twClass: 'text-xs' },
  { label: 'sm', value: 14, twClass: 'text-sm' },
  { label: 'base', value: 16, twClass: 'text-base' },
  { label: 'lg', value: 18, twClass: 'text-lg' },
  { label: 'xl', value: 20, twClass: 'text-xl' }
]

/** 连接点大小选项 */
export const FLOW_HANDLE_SIZE_ITEMS: { label: string, value: number }[] = [
  { label: '4', value: 4 },
  { label: '6', value: 6 },
  { label: '8', value: 8 },
  { label: '10', value: 10 }
]

// ============================================================
// 路径预览 SVG 数据（用于 USelect #item-leading）
// ============================================================

export interface FlowPathPreview {
  /** 'path' 用 <path d=...>，'line' 用 <line> */
  shape: 'path' | 'line'
  d?: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

export const FLOW_PATH_PREVIEW: Record<FlowEdgePathType, FlowPathPreview> = {
  smoothstep: { shape: 'path', d: 'M 0 12 L 6 12 Q 10 12 10 7 Q 10 2 14 2 L 20 2' },
  bezier: { shape: 'path', d: 'M 0 12 C 10 12, 10 2, 20 2' },
  step: { shape: 'path', d: 'M 0 12 L 10 12 L 10 2 L 20 2' },
  straight: { shape: 'line', x1: 0, y1: 12, x2: 20, y2: 2 }
}

// ============================================================
// 箭头预览 SVG 数据（用于 USelect #item-leading）
// ============================================================

export interface FlowArrowSvgElement {
  tag: 'line' | 'polygon' | 'circle'
  attrs: Record<string, string | number>
}

/**
 * 起点箭头预览：箭头图形在左侧，尾线在右侧
 */
export const FLOW_ARROW_PREVIEW_START: Record<FlowArrowType, FlowArrowSvgElement[]> = {
  'none': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ],
  'arrow': [
    { tag: 'polygon', attrs: { points: '10,1 2,5 10,9', fill: 'currentColor' } },
    { tag: 'line', attrs: { 'x1': 8, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ],
  'diamond': [
    { tag: 'polygon', attrs: { points: '2,5 7,1 12,5 7,9', fill: 'currentColor' } },
    { tag: 'line', attrs: { 'x1': 12, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ],
  'diamond-open': [
    { tag: 'polygon', attrs: { 'points': '2,5 7,1 12,5 7,9', 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': 1.5 } },
    { tag: 'line', attrs: { 'x1': 12, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ],
  'circle': [
    { tag: 'circle', attrs: { cx: 6, cy: 5, r: 4, fill: 'currentColor' } },
    { tag: 'line', attrs: { 'x1': 10, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ],
  'circle-open': [
    { tag: 'circle', attrs: { 'cx': 6, 'cy': 5, 'r': 3.5, 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': 1.5 } },
    { tag: 'line', attrs: { 'x1': 10, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ]
}

/**
 * 终点箭头预览：尾线在左侧，箭头图形在右侧
 */
export const FLOW_ARROW_PREVIEW_END: Record<FlowArrowType, FlowArrowSvgElement[]> = {
  'none': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 20, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } }
  ],
  'arrow': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 12, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } },
    { tag: 'polygon', attrs: { points: '10,1 18,5 10,9', fill: 'currentColor' } }
  ],
  'diamond': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 8, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } },
    { tag: 'polygon', attrs: { points: '8,5 13,1 18,5 13,9', fill: 'currentColor' } }
  ],
  'diamond-open': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 8, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } },
    { tag: 'polygon', attrs: { 'points': '8,5 13,1 18,5 13,9', 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': 1.5 } }
  ],
  'circle': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 10, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } },
    { tag: 'circle', attrs: { cx: 14, cy: 5, r: 4, fill: 'currentColor' } }
  ],
  'circle-open': [
    { tag: 'line', attrs: { 'x1': 0, 'y1': 5, 'x2': 10, 'y2': 5, 'stroke': 'currentColor', 'stroke-width': 2 } },
    { tag: 'circle', attrs: { 'cx': 14, 'cy': 5, 'r': 3.5, 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': 1.5 } }
  ]
}

/**
 * 节点鼠标接近阈值（px）
 */
export const FLOW_NODE_PROXIMITY_THRESHOLD = 50

/**
 * Resize handle 配置
 */
export interface FlowResizeHandleConfig {
  edge: ResizeEdge
  class: string
  cursor: string
  zIndex: number
}

export const FLOW_RESIZE_HANDLES: FlowResizeHandleConfig[] = [
  // 4 边 (z-index: 5)
  { edge: 'top', class: 'top-[-4px] left-[12px] right-[12px] h-[12px]', cursor: 'ns-resize', zIndex: 5 },
  { edge: 'bottom', class: 'bottom-[-4px] left-[12px] right-[12px] h-[12px]', cursor: 'ns-resize', zIndex: 5 },
  { edge: 'left', class: 'left-[-4px] top-[12px] bottom-[12px] w-[12px]', cursor: 'ew-resize', zIndex: 5 },
  { edge: 'right', class: 'right-[-4px] top-[12px] bottom-[12px] w-[12px]', cursor: 'ew-resize', zIndex: 5 },
  // 4 角 (z-index: 6, 优先于边)
  { edge: 'top-left', class: 'top-[-4px] left-[-4px] w-[12px] h-[12px]', cursor: 'nwse-resize', zIndex: 6 },
  { edge: 'top-right', class: 'top-[-4px] right-[-4px] w-[12px] h-[12px]', cursor: 'nesw-resize', zIndex: 6 },
  { edge: 'bottom-left', class: 'bottom-[-4px] left-[-4px] w-[12px] h-[12px]', cursor: 'nesw-resize', zIndex: 6 },
  { edge: 'bottom-right', class: 'bottom-[-4px] right-[-4px] w-[12px] h-[12px]', cursor: 'nwse-resize', zIndex: 6 }
]
