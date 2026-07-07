import { defineComponent, h, inject, onMounted, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer } from '@/index'
import type { LayerInstance } from '@/types'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('createLayer / lifecycle', () => {
  it('should render shell container when opened without content', async () => {
    const useLayer = createLayer(Container, {
      props: { title: 'Shell', width: '400px' },
    })
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer()
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    mount(Host)
    await flushPromises()

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.content')).toBeNull()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Shell')
  })

  it('should mount content to body when open is called with content', async () => {
    const useLayer = createLayer(Container, {
      props: { title: 'Create', width: '400px' },
    })
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open({ props: { message: 'hello' } }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await flushPromises()

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Create')
    expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
  })

  it('should unmount dialog when close is called', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'a' } })
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()

    dialog.close()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('should keep mount container when close is called before host unmounts', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'a' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('div')).toBeTruthy()

    dialog.close()
    await wrapper.vm.$nextTick()

    expect(dialog.visible).toBe(false)
    expect(queryBodyDialog()).toBeFalsy()
    expect(document.body.querySelector('div')).toBeTruthy()

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('div')).toBeFalsy()
  })

  it('should reopen with updated props when open is called after close', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'first' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    dialog.close()
    await wrapper.vm.$nextTick()

    dialog.open({ props: { message: 'second' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(dialog.visible).toBe(true)
    expect(document.body.querySelector('.msg')?.textContent).toBe('second')
    expect(document.body.querySelectorAll('div')).toHaveLength(1)
  })

  it('should remount content when open is called after close', async () => {
    const useLayer = createLayer(Container)
    let setupCount = 0

    const Content = defineComponent({
      name: 'RemountContent',
      props: { message: String },
      setup(props) {
        setupCount++
        return () => h('span', { class: 'msg' }, props.message)
      },
    })

    let dialog!: LayerInstance
    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'first' } })
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(setupCount).toBe(1)

    dialog.close()
    await wrapper.vm.$nextTick()

    dialog.open({ props: { message: 'second' } })
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(setupCount).toBe(2)
    expect(document.body.querySelector('.msg')?.textContent).toBe('second')
  })

  it('should preserve inject context when unmount then open is called', async () => {
    const HOST_KEY = Symbol('manual-unmount-key')
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Content = defineComponent({
      name: 'ManualUnmountContent',
      setup() {
        const value = inject<string>(HOST_KEY, 'missing')
        return () => h('span', { class: 'manual-inject' }, value)
      },
    })

    const Host = defineComponent({
      setup() {
        provide(HOST_KEY, 'still-bound')
        dialog = useLayer(Content)
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open()
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')

    dialog.unmount()
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('div')).toBeFalsy()

    dialog.open()
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')
  })

  it('should dispose portal when bind host unmounts', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open({ props: { message: 'host-gone' } }))
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('div')).toBeTruthy()

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('div')).toBeFalsy()
    expect(queryBodyDialog()).toBeFalsy()
  })
})
