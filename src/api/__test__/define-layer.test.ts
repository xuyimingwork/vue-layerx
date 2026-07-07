import { describe, expect, it } from 'vitest'
import { defineLayer, isLayerDefine } from '../define-layer'

describe('defineLayer', () => {
  it('should return outsideLayer handle when not in layer context', () => {
    const layer = defineLayer({ props: { title: 'Page' } })
    expect(layer.inLayer).toBe(false)
    expect(layer.outsideLayer).toBe(true)
    expect(isLayerDefine(layer)).toBe(true)
  })
})

describe('isLayerDefine', () => {
  it('should return false when value is a plain object', () => {
    expect(isLayerDefine({ inLayer: true, outsideLayer: false })).toBe(false)
  })
})
