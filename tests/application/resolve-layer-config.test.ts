import { describe, expect, it } from 'vitest'
import { resolveLayerConfig } from '../../src/application/factory/resolve-layer-config'
import { DEFAULT_VISIBLE } from '../../src/domain/constants/visible'

describe('resolveLayerConfig', () => {
  it('uses default visible protocol when omitted', () => {
    const result = resolveLayerConfig({ props: { title: 'A' } })
    expect(result.visibleProp).toBe(DEFAULT_VISIBLE[0])
    expect(result.visibleEvent).toBe(DEFAULT_VISIBLE[1])
    expect(result.factoryOptions).toEqual({ props: { title: 'A' } })
  })

  it('respects custom visible protocol', () => {
    const result = resolveLayerConfig({ visible: ['open', 'onOpen'] })
    expect(result.visibleProp).toBe('open')
    expect(result.visibleEvent).toBe('onOpen')
  })

  it('accepts empty options', () => {
    const result = resolveLayerConfig()
    expect(result.visibleProp).toBe('modelValue')
    expect(result.factoryOptions).toEqual({})
  })
})
