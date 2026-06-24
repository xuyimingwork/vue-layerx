import { describe, expect, it } from 'vitest'
import { getOwningContentInstance } from '../owning-content'

describe('getOwningContentInstance', () => {
  it('returns null when instance is undefined', () => {
    expect(getOwningContentInstance(undefined)).toBeNull()
  })

  it('walks up to nearest component ancestor', () => {
    const content = { type: { name: 'Content' } }
    const layerSlot = { type: { name: 'LayerTemplate' }, parent: content }
    const fragment = { type: Symbol('Fragment'), parent: layerSlot }

    expect(getOwningContentInstance(fragment as never)).toBe(layerSlot)
    expect(getOwningContentInstance(layerSlot as never)).toBe(content)
  })

  it('returns null when no component ancestor exists', () => {
    const fragment = { type: Symbol('Fragment'), parent: null }
    expect(getOwningContentInstance(fragment as never)).toBeNull()
  })
})
