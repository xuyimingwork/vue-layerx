import { describe, expect, it } from 'vitest'
import { createLayerViewStore } from '@/runtime/layer-view'
import {
  attachLayerStore,
  LAYER_STORE,
  resolveLayerStore,
} from '../layer-store-host'

describe('layer-store-host', () => {
  it('should make store readable via resolveLayerStore after attachLayerStore', () => {
    const host = { id: 'host' }
    const store = createLayerViewStore()

    attachLayerStore(host, store)

    expect(resolveLayerStore(host)).toBe(store)
    expect((host as Record<symbol, unknown>)[LAYER_STORE]).toBe(store)
  })

  it('should throw when store is missing on target', () => {
    expect(() => resolveLayerStore({})).toThrow(
      '[vue-layerx] Layer store not found on target',
    )
  })

  it('should attach LAYER_STORE as non-enumerable on host', () => {
    const host = { visible: true }
    attachLayerStore(host, createLayerViewStore())

    expect(Object.keys(host)).toEqual(['visible'])
    expect(LAYER_STORE in host).toBe(true)
  })
})
