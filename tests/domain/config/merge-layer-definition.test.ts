import { describe, expect, it } from 'vitest'
import { mergeLayerDefinition } from '../../../src/domain/config/merge-layer-definition'

describe('mergeLayerDefinition', () => {
  it('returns undefined when both inputs are undefined', () => {
    expect(mergeLayerDefinition()).toBeUndefined()
  })

  it('merges props, slots, and nested content props', () => {
    const result = mergeLayerDefinition(
      {
        props: { title: 'Base', width: '400px' },
        content: { props: { mode: 'create' } },
      },
      {
        props: { title: 'Override' },
        content: { props: { id: 1 } },
      },
    )

    expect(result).toEqual({
      visible: undefined,
      props: { title: 'Override', width: '400px' },
      slots: {},
      content: { props: { mode: 'create', id: 1 } },
    })
  })

  it('prefers partial visible protocol', () => {
    const result = mergeLayerDefinition(
      { visible: ['open', 'onOpen'] },
      { visible: ['show', 'onShow'] },
    )
    expect(result?.visible).toEqual(['show', 'onShow'])
  })
})
