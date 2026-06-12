import { describe, expect, it } from 'vitest'
import { mergeProps } from '../../../src/domain/config/merge-props'

describe('mergeProps', () => {
  it('returns empty object when no sources', () => {
    expect(mergeProps()).toEqual({})
  })

  it('skips undefined sources', () => {
    expect(mergeProps(undefined, { a: 1 }, undefined, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('later sources override earlier keys', () => {
    expect(mergeProps({ title: 'A', width: '400px' }, { title: 'B' })).toEqual({
      title: 'B',
      width: '400px',
    })
  })
})
