import { describe, expect, it } from 'vitest'
import { isLayerContent, LAYERX_LAYER_CONTENT } from '../layer-content'

describe('isLayerContent', () => {
  it('returns false for null/undefined', () => {
    expect(isLayerContent(null)).toBe(false)
    expect(isLayerContent(undefined)).toBe(false)
  })

  it('detects marker on props', () => {
    expect(isLayerContent({ props: { [LAYERX_LAYER_CONTENT]: true } } as never)).toBe(true)
  })

  it('detects marker on attrs', () => {
    expect(isLayerContent({ attrs: { [LAYERX_LAYER_CONTENT]: true } } as never)).toBe(true)
  })

  it('detects marker on vnode.props', () => {
    expect(
      isLayerContent({
        props: {},
        attrs: {},
        vnode: { props: { [LAYERX_LAYER_CONTENT]: true } },
      } as never),
    ).toBe(true)
  })

  it('returns false when marker absent', () => {
    expect(isLayerContent({ props: {}, attrs: {} } as never)).toBe(false)
  })
})
