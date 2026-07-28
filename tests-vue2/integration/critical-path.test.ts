import Vue, { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer } from 'vue-layerx'
import { flushPromises, withoutDom } from '../helpers/dom'
import { Container, DrawerContainer, makeContent, queryBodyDialog } from '../fixtures/components'

function mountSetup(setup: () => void) {
  const Host = defineComponent({
    setup() {
      setup()
      return () => h('div', { class: 'test-host' })
    },
  })
  const vm = new Vue(Host as never)
  vm.$mount()
  document.body.appendChild(vm.$el)
  return {
    destroy() {
      vm.$destroy()
      vm.$el.remove()
    },
  }
}

describe('critical path (Vue 2.7)', () => {
  it('should open and close with default value model', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      const useLayer = createLayer(Container)
      dialog = useLayer(makeContent())
    })

    dialog.open({
      props: { message: 'hi' },
      container: { props: { title: 'T' } },
    })
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('T')
    expect(dialog.visible).toBe(true)

    dialog.close()
    await flushPromises()
    expect(queryBodyDialog()).toBeFalsy()
    expect(dialog.visible).toBe(false)
    host.destroy()
  })

  it('should remount content when container.component changes while open', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    let mounts = 0

    const TrackingContent = defineComponent({
      name: 'TrackingContent',
      setup() {
        mounts++
        return () => h('span', { class: 'track' })
      },
    })

    const host = mountSetup(() => {
      const useLayer = createLayer(Container)
      dialog = useLayer(TrackingContent)
    })

    dialog.open()
    await flushPromises()
    const afterOpen = mounts

    dialog.open({ container: { component: DrawerContainer } })
    await flushPromises()
    expect(mounts).toBeGreaterThan(afterOpen)
    host.destroy()
  })

  it('should register defineLayer on content root', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    let exists = false

    const Content = defineComponent({
      name: 'DefineContent',
      setup() {
        exists = defineLayer({ props: { title: 'Defined' } }).exists
        return () => h('span', { class: 'defined' })
      },
    })

    const host = mountSetup(() => {
      const useLayer = createLayer(Container)
      dialog = useLayer(Content)
    })

    dialog.open()
    await flushPromises()
    expect(exists).toBe(true)
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Defined')
    host.destroy()
  })

  it('should inherit provide/inject via Host parent', async () => {
    const KEY = 'layer-host-msg'
    let injected: string | undefined

    const Content = defineComponent({
      name: 'InjectContent',
      inject: {
        msg: { from: KEY, default: 'missing' },
      },
      created() {
        injected = (this as unknown as { msg: string }).msg
      },
      render(h) {
        return h('span', { class: 'msg' }, (this as unknown as { msg: string }).msg)
      },
    })

    const Host = defineComponent({
      provide: { [KEY]: 'from-host' },
      setup() {
        const useLayer = createLayer(Container)
        const dialog = useLayer(Content)
        dialog.open()
        return () => h('div', { class: 'test-host' })
      },
    })

    const vm = new Vue(Host as never)
    vm.$mount()
    document.body.appendChild(vm.$el)
    await flushPromises()
    expect(injected).toBe('from-host')
    vm.$destroy()
    vm.$el.remove()
  })

  it('should skip mount without document (SSR)', () => {
    const useLayer = createLayer(Container)
    withoutDom(() => {
      const dialog = useLayer(makeContent())
      expect(() => dialog.open({ props: { message: 'ssr' } })).not.toThrow()
      expect(dialog.visible).toBe(true)
      dialog.unmount()
    })
  })
})
