import { describe, expect, it } from 'vitest'
import { LAYER_CONTENT } from '@/shared/layer-content'
import { h } from 'vue'
import {
  toComponentRoot,
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
      attrs: { title: 'Hi' },
      on: {
        done,
        'update:modelValue': update,
        input: done,
      },
    })
  })

  it('should keep malformed on* keys in attrs when event parse fails', () => {
    expect(toPlatformVNodeData({ onfoo: 1 })).toEqual({
      attrs: { onfoo: 1 },
    })
  })

  it('should lift key ref class style and layer-content mark out of attrs', () => {
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
    expect(data.attrs).toEqual({ width: 100 })
    expect(data[LAYER_CONTENT]).toBe(true)
    expect(data.on).toBeUndefined()
  })

  it('should pass symbol keys through on the data object', () => {
    const sym = Symbol('x')
    const data = toPlatformVNodeData({ [sym]: 1, a: 2 })
    expect(data[sym]).toBe(1)
    expect(data.attrs).toEqual({ a: 2 })
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
    expect(isLayerContent({ $vnode: { data: { [LAYER_CONTENT]: true } } })).toBe(true)
    expect(isLayerContent({ $vnode: { data: {} } })).toBe(false)
  })
})

describe('toComponentRoot', () => {
  it('should return null for empty input', () => {
    expect(toComponentRoot(null)).toBeNull()
    expect(toComponentRoot(undefined)).toBeNull()
    expect(toComponentRoot([])).toBeNull()
  })

  it('should passthrough a single vnode', () => {
    const node = h('button', { class: 'one' }, 'ok')
    expect(toComponentRoot(node)).toBe(node)
    expect(toComponentRoot([node])).toBe(node)
  })

  it('should wrap multiple vnodes in a display:contents layer-fragment', () => {
    const a = h('button', { class: 'a' }, 'a')
    const b = h('button', { class: 'b' }, 'b')
    const root = toComponentRoot([a, b]) as {
      tag?: string
      type?: unknown
      data?: { style?: unknown }
      props?: { style?: unknown }
      children?: unknown
    } | null
    expect(root).toBeTruthy()
    // Root vitest resolves `vue` to 3 (type/props); vue2-coverage uses 2.7 (tag/data).
    expect(root!.tag ?? root!.type).toBe('layer-fragment')
    expect(root!.data?.style ?? root!.props?.style).toEqual({ display: 'contents' })
    expect(root!.children).toEqual([a, b])
  })
})
