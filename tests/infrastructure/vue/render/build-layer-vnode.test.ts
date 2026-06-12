import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { LAYERX_DIRECT_CONTENT } from '../../../../src/domain/constants/markers'
import { buildLayerVNode } from '../../../../src/infrastructure/vue/render/build-layer-vnode'

const Layer = defineComponent({
  name: 'TestLayer',
  props: { modelValue: Boolean, title: String },
  setup(props, { slots }) {
    return () =>
      props.modelValue ? h('div', { class: 'layer', 'data-title': props.title }, slots.default?.()) : null
  },
})

const Content = defineComponent({
  name: 'TestContent',
  props: { message: String },
  emits: ['done'],
  setup(props) {
    return () => h('span', { class: 'msg' }, props.message)
  },
})

describe('buildLayerVNode', () => {
  it('builds layer vnode with merged props and content marker', () => {
    const hide = vi.fn()
    const vnode = buildLayerVNode({
      Layer,
      Content,
      visible: true,
      visibleProp: 'modelValue',
      visibleEvent: 'onUpdate:modelValue',
      factoryOptions: { props: { title: 'Factory' } },
      layerDefinition: null,
      useOptions: { props: { message: 'hello' } },
      showOptions: {},
      slotsVersion: 0,
      hide,
    })

    expect(vnode.type).toBe(Layer)
    expect(vnode.props?.modelValue).toBe(true)
    expect(vnode.props?.title).toBe('Factory')

    const defaultSlot = (vnode.children as { default?: () => unknown }).default?.()
    const contentVNode = defaultSlot as { type: unknown; props: Record<string, unknown> }
    expect(contentVNode.type).toBe(Content)
    expect(contentVNode.props.message).toBe('hello')
    expect(contentVNode.props[LAYERX_DIRECT_CONTENT]).toBe(true)
  })

  it('binds hideOn to content props', () => {
    const hide = vi.fn()
    const vnode = buildLayerVNode({
      Layer,
      Content,
      visible: true,
      visibleProp: 'modelValue',
      visibleEvent: 'onUpdate:modelValue',
      factoryOptions: {},
      layerDefinition: null,
      useOptions: { hideOn: ['done'] },
      showOptions: {},
      slotsVersion: 0,
      hide,
    })

    const defaultSlot = (vnode.children as { default?: () => unknown }).default?.()
    const contentVNode = defaultSlot as { props: Record<string, unknown> }
    ;(contentVNode.props.onDone as () => void)()
    expect(hide).toHaveBeenCalledOnce()
  })
})
