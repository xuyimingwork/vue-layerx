import { describe, expect, it } from 'vitest'
import { LAYERX_DIRECT_CONTENT } from '@/core/constants/markers'
import { hasDirectLayerMarker } from '../layer-marker'

describe('hasDirectLayerMarker', () => {
  it('returns false for null/undefined', () => {
    expect(hasDirectLayerMarker(null)).toBe(false)
    expect(hasDirectLayerMarker(undefined)).toBe(false)
  })

  it('detects marker on props', () => {
    expect(hasDirectLayerMarker({ props: { [LAYERX_DIRECT_CONTENT]: true } } as never)).toBe(true)
  })

  it('detects marker on attrs', () => {
    expect(
      hasDirectLayerMarker({ attrs: { [LAYERX_DIRECT_CONTENT]: true } } as never),
    ).toBe(true)
  })

  it('detects marker on vnode.props', () => {
    expect(
      hasDirectLayerMarker({
        props: {},
        attrs: {},
        vnode: { props: { [LAYERX_DIRECT_CONTENT]: true } },
      } as never),
    ).toBe(true)
  })

  it('returns false when marker absent', () => {
    expect(hasDirectLayerMarker({ props: {}, attrs: {} } as never)).toBe(false)
  })
})
