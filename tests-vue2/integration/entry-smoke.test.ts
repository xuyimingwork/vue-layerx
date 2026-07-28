/**
 * D0.19: Vue 2.7 must be able to resolve / import the published entry
 * without static named imports of Vue 3-only APIs blowing up.
 */
import { describe, expect, it } from 'vitest'

describe('vue-layerx entry (D0.19)', () => {
  it('should import public API under Vue 2.7', async () => {
    const mod = await import('vue-layerx')
    expect(typeof mod.createLayer).toBe('function')
    expect(typeof mod.defineLayer).toBe('function')
    expect(mod.LayerTemplate).toBeTruthy()
    expect(mod.LayerNoContainer).toBeTruthy()
    expect(mod.LayerConfirmError).toBeTruthy()
  })
})
