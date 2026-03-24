// Use string literals matching @vue-flow/core Position enum to avoid SSR import
const Position = {
  Left: 'left',
  Right: 'right',
  Top: 'top',
  Bottom: 'bottom'
} as const

export type HandlePosition
  = | 'tl' | 'tr' | 'bl' | 'br' // 4 corners
    | 't1' | 't2' | 't3' // top edge
    | 'r1' | 'r2' | 'r3' // right edge
    | 'b1' | 'b2' | 'b3' // bottom edge
    | 'l1' | 'l2' | 'l3' // left edge

export type ResizeDirection = 'horizontal' | 'vertical' | 'both'

export interface FlowHandle {
  id: HandlePosition
  position: string
  offsetPercent?: { x?: number, y?: number }
}

export const FLOW_HANDLES: FlowHandle[] = [
  // 4 corners
  { id: 'tl', position: Position.Top, offsetPercent: { x: 0 } },
  { id: 'tr', position: Position.Top, offsetPercent: { x: 100 } },
  { id: 'bl', position: Position.Bottom, offsetPercent: { x: 0 } },
  { id: 'br', position: Position.Bottom, offsetPercent: { x: 100 } },

  // top edge - 3 points
  { id: 't1', position: Position.Top, offsetPercent: { x: 25 } },
  { id: 't2', position: Position.Top, offsetPercent: { x: 50 } },
  { id: 't3', position: Position.Top, offsetPercent: { x: 75 } },

  // right edge - 3 points
  { id: 'r1', position: Position.Right, offsetPercent: { y: 25 } },
  { id: 'r2', position: Position.Right, offsetPercent: { y: 50 } },
  { id: 'r3', position: Position.Right, offsetPercent: { y: 75 } },

  // bottom edge - 3 points
  { id: 'b1', position: Position.Bottom, offsetPercent: { x: 25 } },
  { id: 'b2', position: Position.Bottom, offsetPercent: { x: 50 } },
  { id: 'b3', position: Position.Bottom, offsetPercent: { x: 75 } },

  // left edge - 3 points
  { id: 'l1', position: Position.Left, offsetPercent: { y: 25 } },
  { id: 'l2', position: Position.Left, offsetPercent: { y: 50 } },
  { id: 'l3', position: Position.Left, offsetPercent: { y: 75 } }
]
