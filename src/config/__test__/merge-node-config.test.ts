import { describe, expect, it } from 'vitest'
import { mergeProps, mergeNodeConfig } from '../merge-node-config'

describe('mergeProps', () => {
  it('shallow merges later sources over earlier', () => {
    expect(mergeProps({ a: 1, b: 1 }, { b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
  })
})

describe('mergeNodeConfig', () => {
  it('merges component, props, and slots with later winning', () => {
    const slotA = () => null
    const slotB = () => null

    expect(
      mergeNodeConfig(
        { component: 'A' as never, props: { w: '1' }, slots: { footer: slotA } },
        { component: 'B' as never, props: { w: '2', t: 'x' }, slots: { title: slotB } },
      ),
    ).toEqual({
      component: 'B',
      props: { w: '2', t: 'x' },
      slots: { footer: slotA, title: slotB },
    })
  })
})
