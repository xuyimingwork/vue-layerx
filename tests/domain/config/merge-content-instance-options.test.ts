import { describe, expect, it } from 'vitest'
import { mergeContentInstanceOptions } from '../../../src/domain/config/merge-content-instance-options'

describe('mergeContentInstanceOptions', () => {
  it('returns shallow copy when partial is undefined', () => {
    const base = { props: { a: 1 }, hideOn: ['done'] as string[] }
    const result = mergeContentInstanceOptions(base)
    expect(result).toEqual(base)
    expect(result).not.toBe(base)
  })

  it('merges props, slots, hideOn, and nested layer', () => {
    const result = mergeContentInstanceOptions(
      {
        props: { mode: 'create' },
        hideOn: ['cancel'],
        layer: { props: { width: '400px' } },
      },
      {
        props: { id: 1 },
        hideOn: ['done'],
        layer: { props: { title: 'Edit' } },
      },
    )

    expect(result).toEqual({
      props: { mode: 'create', id: 1 },
      slots: {},
      hideOn: ['done'],
      layer: {
        visible: undefined,
        props: { width: '400px', title: 'Edit' },
        slots: {},
        content: { props: {} },
      },
    })
  })
})
