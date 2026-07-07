import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer } from '@/index'
import type { LayerInstance } from '@/types'
import { flushPromises } from '@tests/helpers/dom'
import {
  Container,
  makeContent,
  queryAllBodyDialogs,
  queryBodyDialog,
} from '@tests/fixtures/components'

describe('createLayer / clone', () => {
  it('should allow parallel open with independent DOM and visible state', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content)
        cloned = base.clone({ container: { props: { title: 'Cloned' } } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(base.visible).toBe(true)
    expect(cloned.visible).toBe(true)
    expect(queryAllBodyDialogs()).toHaveLength(2)
    expect([...document.body.querySelectorAll('.msg')].map((el) => el.textContent)).toEqual([
      'base',
      'cloned',
    ])
  })

  it('should dispose base and cloned mount containers when host unmounts', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content)
        cloned = base.clone()
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(document.body.querySelectorAll('div')).toHaveLength(2)

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelectorAll('div')).toHaveLength(0)
  })

  it('should dispose nested clone chain mount containers when host unmounts', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let base!: LayerInstance
    let mid!: LayerInstance
    let leaf!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content)
        mid = base.clone({ container: { props: { title: 'Mid' } } })
        leaf = mid.clone({ container: { props: { title: 'Leaf' } } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    mid.open({ props: { message: 'mid' } })
    leaf.open({ props: { message: 'leaf' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(document.body.querySelectorAll('div')).toHaveLength(3)

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelectorAll('div')).toHaveLength(0)
  })

  it('should not tear down sibling DOM when clone close is called without show', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content)
        cloned = base.clone()
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    cloned.close()
    await wrapper.vm.$nextTick()

    expect(base.visible).toBe(true)
    expect(cloned.visible).toBe(false)
    expect(queryAllBodyDialogs()).toHaveLength(1)
    expect(document.body.querySelector('.msg')?.textContent).toBe('base')
  })

  it('should remove only its own dialog when clone close is called while both are open', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content, { container: { props: { title: 'Base' } } })
        cloned = base.clone({ container: { props: { title: 'Cloned' } } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await flushPromises()

    cloned.close()
    await wrapper.vm.$nextTick()

    expect(cloned.visible).toBe(false)
    expect(base.visible).toBe(true)
    expect(queryAllBodyDialogs()).toHaveLength(1)
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Base')
    expect(document.body.querySelector('.msg')?.textContent).toBe('base')
  })

  it('should create independent instance with clone-specific defaults', async () => {
    const useLayer = createLayer(Container, {
      props: { title: 'Factory' },
    })
    const Content = makeContent()
    let base!: LayerInstance
    let cloned!: LayerInstance

    const Host = defineComponent({
      setup() {
        base = useLayer(Content, { container: { props: { title: 'Base' } } })
        cloned = base.clone({ container: { props: { title: 'Cloned' } } })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    base.open({ props: { message: 'base' } })
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Base')

    base.close()
    await wrapper.vm.$nextTick()

    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Cloned')
    expect(document.body.querySelector('.msg')?.textContent).toBe('cloned')
  })
})
