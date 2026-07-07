import { defineComponent, h, inject, onMounted, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer } from '@/index'
import type { LayerInstance } from '@/types'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('createLayer / inject and bindHost', () => {
  it('should inject value provided by host setup useLayer', async () => {
    const HOST_KEY = Symbol('host-key')
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance
    let injected: string | undefined

    const Content = defineComponent({
      name: 'InjectContent',
      setup() {
        injected = inject<string>(HOST_KEY)
        return () => h('span', { class: 'injected' }, injected ?? '')
      },
    })

    const Host = defineComponent({
      setup() {
        provide(HOST_KEY, 'from-host')
        dialog = useLayer(Content)
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    mount(Host)
    await flushPromises()

    expect(document.body.querySelector('.injected')?.textContent).toBe('from-host')
    expect(injected).toBe('from-host')
  })

  it('should inject value from ancestor provider wrapping host', async () => {
    const CONFIG_KEY = Symbol('config-key')
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Content = defineComponent({
      name: 'ConfigInjectContent',
      setup() {
        const locale = inject<string>(CONFIG_KEY, 'missing')
        return () => h('span', { class: 'locale' }, locale)
      },
    })

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    const Root = defineComponent({
      setup() {
        provide(CONFIG_KEY, 'zh-cn')
        return () => h(Host)
      },
    })

    mount(Root)
    await flushPromises()

    expect(document.body.querySelector('.locale')?.textContent).toBe('zh-cn')
  })

  it('should open without inject when detached useLayer has no bindHost', async () => {
    const HOST_KEY = Symbol('detached-key')
    const useLayer = createLayer(Container)

    const Content = defineComponent({
      name: 'DetachedInjectContent',
      setup() {
        const value = inject<string>(HOST_KEY, 'fallback')
        return () => h('span', { class: 'detached-inject' }, value)
      },
    })

    const dialog = useLayer(Content)
    dialog.open()
    await flushPromises()

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.detached-inject')?.textContent).toBe('fallback')
  })

  it('should inherit host provide when bindHost is called in setup', async () => {
    const HOST_KEY = Symbol('bind-host-key')
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Content = defineComponent({
      name: 'BindHostInjectContent',
      setup() {
        const value = inject<string>(HOST_KEY, 'fallback')
        return () => h('span', { class: 'bind-inject' }, value)
      },
    })

    dialog = useLayer(Content)

    const App = defineComponent({
      setup() {
        provide(HOST_KEY, 'from-app')
        dialog.bindHost()
        onMounted(() => dialog.open())
        return () => h('app-root')
      },
    })

    mount(App)
    await flushPromises()

    expect(document.body.querySelector('.bind-inject')?.textContent).toBe('from-app')
  })

  it('should ignore second bindHost call', async () => {
    const FIRST_KEY = Symbol('first')
    const SECOND_KEY = Symbol('second')
    const useLayer = createLayer(Container)
    let dialog!: LayerInstance

    const Content = defineComponent({
      name: 'BindOnceContent',
      setup() {
        const first = inject<string>(FIRST_KEY)
        const second = inject<string>(SECOND_KEY)
        const value = first ?? second ?? 'none'
        return () => h('span', { class: 'bind-once' }, value)
      },
    })

    dialog = useLayer(Content)

    const SecondHost = defineComponent({
      setup() {
        provide(SECOND_KEY, 'second')
        dialog.bindHost()
        onMounted(() => dialog.open())
        return () => h('second-host')
      },
    })

    const FirstHost = defineComponent({
      setup() {
        provide(FIRST_KEY, 'first')
        dialog.bindHost()
        return () => h(SecondHost)
      },
    })

    mount(FirstHost)
    await flushPromises()

    expect(document.body.querySelector('.bind-once')?.textContent).toBe('first')
  })

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
