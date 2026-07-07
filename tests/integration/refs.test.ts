import { defineComponent, h, onMounted, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer } from '@/index'
import type { LayerInstance } from '@/types'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'

describe('createLayer / refs', () => {
  it('should expose contentRef with defineExpose after open', async () => {
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Content = defineComponent({
      name: 'ExposeContent',
      props: { message: String },
      setup(props, { expose }) {
        expose({ ping: () => 'pong' })
        return () => h('span', { class: 'msg' }, props.message)
      },
    })

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open({ props: { message: 'hi' } }))
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(dialog.contentRef.value?.ping?.()).toBe('pong')
  })

  it('should set contentRef to null when layer is closed', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open({ props: { message: 'hi' } }))
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(dialog.contentRef.value).not.toBeNull()

    dialog.close()
    await wrapper.vm.$nextTick()
    expect(dialog.contentRef.value).toBeNull()
  })

  it('should track container component in containerRef while visible', async () => {
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer()
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(dialog.containerRef.value).not.toBeNull()
    dialog.close()
    await wrapper.vm.$nextTick()
    expect(dialog.containerRef.value).toBeNull()
  })

  it('should chain props.ref Ref with internal ref onto same content instance', async () => {
    const useLayer = createLayer(Container)
    const userRef = ref<unknown>(null)
    let dialog!: LayerInstance

    const Content = defineComponent({
      name: 'UserRefContent',
      props: { message: String },
      setup(props, { expose }) {
        expose({ marker: 'content' })
        return () => h('span', { class: 'msg' }, props.message)
      },
    })

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, { props: { ref: userRef } })
        onMounted(() => dialog.open({ props: { message: 'ref' } }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await flushPromises()

    expect(userRef.value).toBe(dialog.contentRef.value)
    expect(dialog.contentRef.value?.marker).toBe('content')
  })

  it('should not inherit parent use props.ref on clone', async () => {
    const useLayer = createLayer(Container)
    const parentRef = ref<unknown>(null)
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content, { props: { ref: parentRef } })
        cloned = base.clone()
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(parentRef.value).toBe(base.contentRef.value)
    expect(cloned.contentRef.value).not.toBe(parentRef.value)
  })

  it('should accept clone-specific props.ref', async () => {
    const useLayer = createLayer(Container)
    const parentRef = ref<unknown>(null)
    const childRef = ref<unknown>(null)
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content, { props: { ref: parentRef } })
        cloned = base.clone({ props: { ref: childRef } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(parentRef.value).toBe(base.contentRef.value)
    expect(childRef.value).toBe(cloned.contentRef.value)
    expect(childRef.value).not.toBe(parentRef.value)
  })
})
