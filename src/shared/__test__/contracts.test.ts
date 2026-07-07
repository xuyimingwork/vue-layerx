import { describe, expect, it } from 'vitest'
import { isLayerContent, LAYER_CONTENT } from '../contracts'

describe('isLayerContent', () => {
  it('should return false when value is null or undefined', () => {
    expect(isLayerContent(null)).toBe(false)
    expect(isLayerContent(undefined)).toBe(false)
  })

  it('should detect marker on props', () => {
    expect(isLayerContent({ props: { [LAYER_CONTENT]: true } } as never)).toBe(true)
  })

  it('should detect marker on attrs', () => {
    expect(isLayerContent({ attrs: { [LAYER_CONTENT]: true } } as never)).toBe(true)
  })

  it('should detect marker on vnode.props', () => {
    expect(
      isLayerContent({
        props: {},
        attrs: {},
        vnode: { props: { [LAYER_CONTENT]: true } },
      } as never),
    ).toBe(true)
  })

  it('should return false when marker is absent', () => {
    expect(isLayerContent({ props: {}, attrs: {} } as never)).toBe(false)
  })
})
