import { defineComponent, h, inject, onMounted, provide } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createLayer, defineLayer, LayerTemplate } from '@/index'
import type { LayerInstance, LayerTemplateScope } from '@/types'
import {
  Container,
  makeContent,
  queryAllBodyDialogs,
  queryBodyDialog,
} from '../fixtures/components'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createLayer (integration)', () => {
  it('opens shell layer without bound content', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.content')).toBeNull()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Shell')
  })

  it('opens via .open() without template (body)', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Create')
    expect(queryBodyDialog()?.getAttribute('data-width')).toBe('400px')
  })

  it('merges config across all layers end-to-end', async () => {
    const useLayer = createLayer(Container, {
      props: { title: 'Default', width: '400px' },
    })
    const Content = makeContent(true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, {
          container: { props: { width: '640px' } },
        })
        onMounted(() =>
          dialog.open({
            props: { message: 'merged' },
            container: { props: { title: 'FromShow' } },
          }),
        )
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    const el = queryBodyDialog()
    expect(el?.getAttribute('data-title')).toBe('FromShow')
    expect(el?.getAttribute('data-width')).toBe('640px')
  })

  it('merges default content props from createLayer', async () => {
    const useLayer = createLayer(Container, {
      content: { props: { message: 'default-msg' } },
    })
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.msg')?.textContent).toBe('default-msg')
  })

  it('renders defineLayer LayerTemplate content into container slot', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent(true)
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open({ props: { message: 'slot' } }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.footer-btn')).toBeTruthy()
    expect(document.querySelector('.content .footer-btn')).toBeFalsy()
  })

  it('closes on closeOn content events', async () => {
    const useLayer = createLayer(Container)
    const Content = makeContent()
    let dialog!: LayerInstance

    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content, { closeOn: ['done'] })
        return () => h('motion-host')
      },
    })

    const wrapper = mount(Host)
    dialog.open({ props: { message: 'x' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('show closeOn works when useDialog has no closeOn', async () => {
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
    dialog.open({ props: { message: 'x' }, closeOn: ['done'] })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('exposes .close()', async () => {
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
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()).toBeTruthy()

    dialog.close()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('hide() closes layer but keeps mount container until host unmounts', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

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

  it('show() after hide() reopens without host remount', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    dialog.close()
    await wrapper.vm.$nextTick()

    dialog.open({ props: { message: 'second' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(dialog.visible).toBe(true)
    expect(document.body.querySelector('.msg')?.textContent).toBe('second')
    expect(document.body.querySelectorAll('div')).toHaveLength(1)
  })

  it('clone() allows parallel show() with independent DOM and visible state', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(base.visible).toBe(true)
    expect(cloned.visible).toBe(true)
    expect(queryAllBodyDialogs()).toHaveLength(2)
    expect([...document.body.querySelectorAll('.msg')].map((el) => el.textContent)).toEqual([
      'base',
      'cloned',
    ])
  })

  it('host unmount disposes base and cloned mount containers together', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelectorAll('div')).toHaveLength(2)

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelectorAll('div')).toHaveLength(0)
  })

  it('host unmount disposes nested clone chain mount containers', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelectorAll('div')).toHaveLength(3)

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelectorAll('div')).toHaveLength(0)
  })

  it('clone.close() without show does not tear down sibling instance DOM', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    cloned.close()
    await wrapper.vm.$nextTick()

    expect(base.visible).toBe(true)
    expect(cloned.visible).toBe(false)
    expect(queryAllBodyDialogs()).toHaveLength(1)
    expect(document.body.querySelector('.msg')?.textContent).toBe('base')
  })

  it('clone.close() only removes its own dialog when both are open', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    cloned.close()
    await wrapper.vm.$nextTick()

    expect(cloned.visible).toBe(false)
    expect(base.visible).toBe(true)
    expect(queryAllBodyDialogs()).toHaveLength(1)
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Base')
    expect(document.body.querySelector('.msg')?.textContent).toBe('base')
  })

  it('clone() creates independent instance with clone defaults', async () => {
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
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Base')

    base.close()
    await wrapper.vm.$nextTick()

    cloned.open({ props: { message: 'cloned' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Cloned')
    expect(document.body.querySelector('.msg')?.textContent).toBe('cloned')
  })

  it('defineLayer does not activate when content used outside layer', () => {
    const Content = makeContent(true)
    const wrapper = mount(Content, { props: { message: 'page' } })
    expect(wrapper.find('.footer-btn').exists()).toBe(false)
    expect(wrapper.find('.done').exists()).toBe(true)
  })

  it('nested content defineLayer and LayerTemplate do not bind to parent layer', async () => {
    const useLayer = createLayer(Container)

    const InnerContent = defineComponent({
      name: 'InnerContent',
      setup() {
        defineLayer({
          props: { title: 'InnerShouldNotApply' },
        })

        return () =>
          h('div', { class: 'inner' }, [
            h(
              LayerTemplate,
              { name: 'footer', visibleOutside: true },
              ({ inLayer, outsideLayer, slotProps }: LayerTemplateScope) => [
                h('span', { class: 'inner-in-layer' }, String(inLayer)),
                h('span', { class: 'inner-outside-layer' }, String(outsideLayer)),
                h('span', { class: 'inner-slot-props-empty' }, String(Object.keys(slotProps).length === 0)),
                h('button', { class: 'inner-footer' }, 'inner'),
              ],
            ),
          ])
      },
    })

    const OuterContent = defineComponent({
      name: 'OuterContent',
      setup() {
        defineLayer({
          props: { title: 'OuterTitle' },
        })

        return () =>
          h('div', { class: 'outer' }, [
            h('span', { class: 'outer-msg' }, 'outer'),
            h(InnerContent),
            h(LayerTemplate, { name: 'footer' }, () =>
              h('button', { class: 'outer-footer' }, 'outer'),
            ),
          ])
      },
    })

    let dialog!: LayerInstance
    const Host = defineComponent({
      setup() {
        dialog = useLayer(OuterContent)
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('OuterTitle')
    expect(document.body.querySelector('.outer-footer')).toBeTruthy()
    expect(document.body.querySelector('.inner-in-layer')?.textContent).toBe('false')
    expect(document.body.querySelector('.inner-outside-layer')?.textContent).toBe('true')
    expect(document.body.querySelector('.inner .inner-footer')).toBeTruthy()
  })

  it('render() passes inLayer scope when LayerTemplate content is rendered into container slot', async () => {
    const useLayer = createLayer(Container)
    let captured: LayerTemplateScope | undefined

    const Content = defineComponent({
      name: 'ContentWithScopeCapture',
      props: { message: String },
      setup(props) {
        return () =>
          h('motion-div', { class: 'content' }, [
            h('span', { class: 'msg' }, props.message),
            h(
              LayerTemplate,
              { name: 'footer' },
              (templateScope: LayerTemplateScope) => {
                captured = templateScope
                return h('button', { class: 'footer-btn' }, 'footer')
              },
            ),
          ])
      },
    })

    let dialog!: LayerInstance
    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open({ props: { message: 'scope' } }))
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.footer-btn')).toBeTruthy()
    expect(captured).toEqual({
      inLayer: true,
      outsideLayer: false,
      slotProps: {},
    })
  })

  it('forwards content scoped slot props into LayerTemplate slotProps', async () => {
    const useLayer = createLayer(Container)
    let captured: LayerTemplateScope | undefined

    const Content = defineComponent({
      name: 'ContentWithScopedSlot',
      setup(_props, { slots }) {
        return () =>
          h('motion-div', { class: 'content' }, slots.extra?.({ data: 'from-content' }))
      },
    })

    let dialog!: LayerInstance
    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        return () =>
          h(LayerTemplate, { to: dialog, name: 'extra' }, (templateScope: LayerTemplateScope) => {
            captured = templateScope
            return h('span', { class: 'scoped-extra' }, String(templateScope.slotProps.data))
          })
      },
    })

    const wrapper = mount(Host)
    dialog.open()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.scoped-extra')?.textContent).toBe('from-content')
    expect(captured).toEqual({
      inLayer: true,
      outsideLayer: false,
      slotProps: { data: 'from-content' },
    })
  })

  it('forwards layer scoped slot props into LayerTemplate slotProps', async () => {
    const ScopedFooterLayer = defineComponent({
      name: 'ScopedFooterLayer',
      props: { modelValue: Boolean },
      emits: ['update:modelValue'],
      setup(props, { slots }) {
        return () =>
          props.modelValue
            ? h('motion-dialog', {}, [
                slots.default?.(),
                slots.footer?.({ confirmLoading: true }),
              ])
            : null
      },
    })

    const useLayer = createLayer(ScopedFooterLayer)
    let captured: LayerTemplateScope | undefined

    const Content = defineComponent({
      name: 'ContentWithLayerScopedFooter',
      setup() {
        return () =>
          h(
            LayerTemplate,
            { name: 'footer' },
            (templateScope: LayerTemplateScope) => {
              captured = templateScope
              return h(
                'button',
                { class: 'footer-btn' },
                String(templateScope.slotProps.confirmLoading),
              )
            },
          )
      },
    })

    let dialog!: LayerInstance
    const Host = defineComponent({
      setup() {
        dialog = useLayer(Content)
        onMounted(() => dialog.open())
        return () => h('motion-host')
      },
    })

    mount(Host)
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.footer-btn')?.textContent).toBe('true')
    expect(captured).toEqual({
      inLayer: true,
      outsideLayer: false,
      slotProps: { confirmLoading: true },
    })
  })

  it('remounts content on each show()', async () => {
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
    await new Promise((r) => setTimeout(r, 0))
    expect(setupCount).toBe(1)

    dialog.open({ props: { message: 'second' } })
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(setupCount).toBe(2)
    expect(document.body.querySelector('.msg')?.textContent).toBe('second')
  })

  it('content injects value provided by host setup useLayer', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.injected')?.textContent).toBe('from-host')
    expect(injected).toBe('from-host')
  })

  it('content injects from ancestor provider wrapping host', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.locale')?.textContent).toBe('zh-cn')
  })

  it('detached useLayer without bindHost opens bare without inject', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('.detached-inject')?.textContent).toBe('fallback')
  })

  it('detached useLayer bindHost in setup inherits host provide', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.bind-inject')?.textContent).toBe('from-app')
  })

  it('bindHost ignores second call', async () => {
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
    await new Promise((r) => setTimeout(r, 0))

    expect(document.body.querySelector('.bind-once')?.textContent).toBe('first')
  })

  it('manual unmount clears portal but keeps viewHost for reopen inject', async () => {
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
    await new Promise((r) => setTimeout(r, 0))
    expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')

    dialog.unmount()
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('div')).toBeFalsy()

    dialog.open()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(document.body.querySelector('.manual-inject')?.textContent).toBe('still-bound')
  })

  it('bind point unmount clears viewHost and disposes portal containers', async () => {
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
    await new Promise((r) => setTimeout(r, 0))
    expect(queryBodyDialog()).toBeTruthy()
    expect(document.body.querySelector('div')).toBeTruthy()

    wrapper.unmount()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('div')).toBeFalsy()
    expect(queryBodyDialog()).toBeFalsy()
  })
})
