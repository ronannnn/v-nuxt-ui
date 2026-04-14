import test from 'node:test'
import assert from 'node:assert/strict'

const { FLOW_COLORS, resolveFlowColor } = await import(new URL('./flow.ts', import.meta.url).href)

test('FLOW_COLORS uses primary as the first selectable color', () => {
  assert.deepEqual(FLOW_COLORS[0], { color: 'primary', chip: 'primary' })
})

test('resolveFlowColor returns primary CSS vars', () => {
  assert.equal(resolveFlowColor('primary', 'border', false), 'var(--color-primary-500)')
  assert.equal(resolveFlowColor('primary', 'border', true), 'var(--color-primary-400)')
})
