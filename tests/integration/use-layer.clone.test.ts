import { defineComponent, h, inject, onMounted, provide, ref, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import {
  Container,
  makeContent,
  queryAllBodyDialogs,
  queryBodyDialog,
} from '@tests/fixtures/components'

describe('LayerInstance.clone', () => {
  describe('parallel instances', () => {
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
      expect(Array.from(document.body.querySelectorAll('.msg')).map((el) => el.textContent)).toEqual([
        'base',
        'cloned',
      ])
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
  })

  describe('independent defaults', () => {
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

  describe('cleanup', () => {
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
  })

  describe('bindHost', () => {
    it('should keep clone bindHost independent from parent bindHost', async () => {
      const OUTER_KEY = Symbol('outer')
      const INNER_KEY = Symbol('inner')
      const useLayer = createLayer(Container)
      let base!: LayerInstance
      let cloned!: LayerInstance

      const Content = defineComponent({
        name: 'CloneIndependentInjectContent',
        setup() {
          const outer = inject<string>(OUTER_KEY, 'no-outer')
          const inner = inject<string>(INNER_KEY, 'no-inner')
          return () => h('span', { class: 'clone-independent-inject' }, `${outer}|${inner}`)
        },
      })

      base = useLayer(Content)

      const InnerHost = defineComponent({
        setup() {
          provide(INNER_KEY, 'from-inner')
          cloned = base.clone()
          onMounted(() => cloned.open())
          return () => h('inner-host')
        },
      })

      const OuterHost = defineComponent({
        setup() {
          provide(OUTER_KEY, 'from-outer')
          onMounted(() => base.bindHost())
          return () => h(InnerHost)
        },
      })

      mount(OuterHost)
      await flushPromises()

      expect(document.body.querySelector('.clone-independent-inject')?.textContent).toBe(
        'from-outer|from-inner',
      )

      base.open()
      await flushPromises()

      expect(document.body.querySelector('.clone-independent-inject')?.textContent).toBe(
        'from-outer|from-inner',
      )
    })

    it('should auto bindHost for detached clone created in setup', async () => {
      const HOST_KEY = Symbol('detached-clone-bind')
      const useLayer = createLayer(Container)
      let cloned!: LayerInstance

      const Content = defineComponent({
        name: 'DetachedCloneBindContent',
        setup() {
          const value = inject<string>(HOST_KEY, 'fallback')
          return () => h('span', { class: 'detached-clone-inject' }, value)
        },
      })

      const base = useLayer(Content)

      const Host = defineComponent({
        setup() {
          provide(HOST_KEY, 'from-host')
          cloned = base.clone()
          onMounted(() => cloned.open())
          return () => h('motion-host')
        },
      })

      mount(Host)
      await flushPromises()

      expect(document.body.querySelector('.detached-clone-inject')?.textContent).toBe('from-host')
    })
  })

  describe('instance refs', () => {
    it('should not inherit parent use props.ref on clone', async () => {
      const useLayer = createLayer(Container)
      const parentRef = shallowRef<unknown>(null)
      const Content = makeContent()
      let base!: LayerInstance
      let cloned!: LayerInstance

      const Host = defineComponent({
        setup() {
          base = useLayer(Content, { props: { ref: (el: any) => parentRef.value = el } })
          cloned = base.clone()
          return () => h('motion-host')
        },
      })

      const wrapper = mount(Host)
      base.open({ props: { message: 'base' } })
      console.log('base.open')
      cloned.open({ props: { message: 'cloned' } })
      console.log('cloned.open')
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(parentRef.value === base.contentRef.value).toBe(true)
      expect(parentRef.value === cloned.contentRef.value).toBe(false)
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
      // 会导致 [Vue warn]: Avoid app logic that relies on enumerating keys on a component instance.
      // expect(childRef.value).not.toBe(parentRef.value)
      expect(childRef.value === parentRef.value).toBe(false)
    })
  })
})
