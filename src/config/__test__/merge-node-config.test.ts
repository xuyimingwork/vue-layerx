import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mergeProps, mergeNodeConfig } from '../merge-node-config'

describe('mergeProps', () => {
  it('should shallow merge later sources over earlier ones', () => {
    expect(mergeProps({ a: 1, b: 1 }, { b: 2, c: 3 })).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should chain ref callbacks in source order', () => {
    const calls: string[] = []
    const a = vi.fn(() => calls.push('a'))
    const b = vi.fn(() => calls.push('b'))
    const c = vi.fn(() => calls.push('c'))

    const merged = mergeProps(
      { ref: a },
      { ref: b },
      { ref: c },
    )

    expect(typeof merged.ref).toBe('function')
    ;(merged.ref as (el: null) => void)(null)
    expect(calls).toEqual(['a', 'b', 'c'])
  })

  it('should chain ref Ref objects', () => {
    const userRef = ref(null)
    const internal = vi.fn()
    const merged = mergeProps({ ref: internal }, { ref: userRef })

    const el = { id: 'x' } as never
    ;(merged.ref as (el: never) => void)(el)
    expect(internal).toHaveBeenCalledWith(el)
    expect(userRef.value).toStrictEqual(el)
  })

  it('should warn and ignore string ref', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = vi.fn()
    const merged = mergeProps({ ref: fn }, { ref: 'formRef' })

    ;(merged.ref as (el: null) => void)(null)
    expect(fn).toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('mergeNodeConfig', () => {
  it('should merge component, props, and slots with later sources winning', () => {
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
