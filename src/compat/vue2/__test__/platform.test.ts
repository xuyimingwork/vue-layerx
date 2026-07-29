import { describe, expect, it } from 'vitest'
import {
  isLayerContent,
  markLayerContent,
  toPlatformSlots,
  toPlatformVNodeData,
} from '../platform'

describe('toPlatformVNodeData', () => {
  it('should map onUpdate and onXxx flat keys into on', () => {
    const done = () => {}
    const update = () => {}
    expect(
      toPlatformVNodeData({
        title: 'Hi',
        onDone: done,
        'onUpdate:modelValue': update,
        onInput: done,
      }),
    ).toEqual({
      props: { title: 'Hi' },
      on: {
        done,
        'update:modelValue': update,
        input: done,
      },
    })
  })

  it('should keep malformed on* keys in props when event parse fails', () => {
    expect(toPlatformVNodeData({ onfoo: 1 })).toEqual({
      props: { onfoo: 1 },
    })
  })

  it('should lift key ref class style and layer-content mark out of props', () => {
    const data = toPlatformVNodeData(
      markLayerContent({
        key: 1,
        ref: 'el',
        class: 'x',
        style: { color: 'red' },
        width: 100,
      }),
    )
    expect(data.key).toBe(1)
    expect(data.ref).toBe('el')
    expect(data.class).toBe('x')
    expect(data.style).toEqual({ color: 'red' })
    expect(data.props).toEqual({ width: 100 })
    expect(data.vueLayerxLayerContent).toBe(true)
    expect(data.on).toBeUndefined()
  })

  it('should pass symbol keys through on the data object', () => {
    const sym = Symbol('x')
    const data = toPlatformVNodeData({ [sym]: 1, a: 2 })
    expect(data[sym]).toBe(1)
    expect(data.props).toEqual({ a: 2 })
  })
})

describe('toPlatformSlots', () => {
  it('should omit scopedSlots when empty', () => {
    expect(toPlatformSlots({})).toEqual({})
    expect(toPlatformSlots({ footer: undefined })).toEqual({})
  })

  it('should wrap defined slot renders as scopedSlots with proxy for $slots', () => {
    const footer = () => null
    const result = toPlatformSlots({ footer, header: undefined })
    expect(result.scopedSlots?.footer).toBeTypeOf('function')
    expect(result.scopedSlots?.footer).not.toBe(footer)
    expect(
      (result.scopedSlots?.footer as { proxy?: boolean } | undefined)?.proxy,
    ).toBe(true)
    expect(result.scopedSlots?.header).toBeUndefined()
  })
})

describe('isLayerContent', () => {
  it('should read mark from $vnode.data on the setup proxy', () => {
    expect(isLayerContent(null)).toBe(false)
    expect(isLayerContent({ $vnode: { data: { vueLayerxLayerContent: true } } })).toBe(
      true,
    )
    expect(isLayerContent({ $vnode: { data: {} } })).toBe(false)
  })
})
