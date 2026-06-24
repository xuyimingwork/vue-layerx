import { describe, expect, it } from 'vitest'
import { LAYERX_DIRECT_CONTENT } from '@/constants/markers'
import { isInDirectLayerContent } from '../in-layer-content'

describe('isInDirectLayerContent', () => {
  it('returns true when owning content has direct layer marker', () => {
    const content = {
      type: { name: 'Content' },
      props: { [LAYERX_DIRECT_CONTENT]: true },
    }
    const slot = { type: { name: 'LayerTemplate' }, parent: content }

    expect(isInDirectLayerContent(slot as never)).toBe(true)
  })

  it('returns false when owning content lacks marker', () => {
    const content = { type: { name: 'Content' }, props: {}, attrs: {} }
    const slot = { type: { name: 'LayerTemplate' }, parent: content }

    expect(isInDirectLayerContent(slot as never)).toBe(false)
  })
})
