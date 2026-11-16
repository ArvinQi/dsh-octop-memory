import assert from 'node:assert/strict'
import test from 'node:test'

import { renderHits } from '../lib/text.js'

const longHit = { snippet: 'x'.repeat(1213), layer: 'atom', occurred_at: '2026-11-16T00:00:00Z' }
const shortHit = { snippet: '第二条摘要', layer: 'atom' }

test('超长首条不会把整次召回渲染成空串（回归：默认 recallMaxChars=1200）', () => {
  const out = renderHits([longHit], 1200)
  assert.ok(out.length > 0, '必须至少注入一条')
  assert.ok(out.includes('…'), '超长片段应被截断')
  assert.ok(out.length <= 1200, `总长应 <= maxChars，实际 ${out.length}`)
  assert.ok(out.includes('memory_get'), '尾部说明应保留')
})

test('多条命中按预算逐条截断，且带上尾部说明', () => {
  const out = renderHits([longHit, shortHit], 1200)
  assert.ok(out.length <= 1200)
  assert.ok(out.includes('memory_get'))
})

test('正常片段原样渲染', () => {
  const out = renderHits([shortHit], 1200)
  const line = out.split('\n').find((l) => l.includes('第二条摘要'))
  assert.ok(line, '应包含该摘要')
  assert.ok(!line.endsWith('…'), '正常片段不应被截断')
})

test('空命中返回空串', () => {
  assert.equal(renderHits([], 1200), '')
  assert.equal(renderHits([{ snippet: '   ' }], 1200), '')
})
