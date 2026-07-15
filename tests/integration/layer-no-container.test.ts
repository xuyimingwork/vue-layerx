import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import {
  createLayer,
  LayerNoContainer,
  type LayerInstance,
} from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'
import {
  MonolithDialog,
  queryBodyMonolith,
} from '@tests/fixtures/monolith-dialog'

function withDialog(component?: Component) {
  return component === MonolithDialog
}

const useLayer = createLayer(Container, {
  props: { width: '480px', title: 'Factory' },
  adapter: (fragment) => {
    if (withDialog(fragment.content?.component)) {
      return {
        ...fragment,
        container: {
          ...fragment.container,
          component: LayerNoContainer,
        },
      }
    }
    return fragment
  },
})

async function mountOpen(
  Content: Component,
  open?: (dialog: LayerInstance) => void,
) {
  let dialog!: LayerInstance
  const wrapper = mount(
    defineComponent({
      setup() {
        dialog = useLayer(Content, { closeOn: ['success', 'done'] })
        onMounted(() => {
          if (open) open(dialog)
          else dialog.open()
        })
        return () => h('motion-host')
      },
    }),
  )
  await flushPromises()
  return { dialog, wrapper }
}

describe('LayerNoContainer', () => {
  it('should render default slot when used as a standalone component', () => {
    const wrapper = mount(LayerNoContainer, {
      slots: {
        default: () => h('span', { class: 'slot-body' }, 'hello'),
      },
    })

    expect(wrapper.find('.slot-body').text()).toBe('hello')
  })

  it('should render nothing when standalone LayerNoContainer has no default slot', () => {
    const wrapper = mount(LayerNoContainer)
    expect(wrapper.html()).toBe('')
    expect(wrapper.element.childNodes.length).toBe(0)
  })

  it('should flatten monolith content when adapter swaps to LayerNoContainer', async () => {
    const { dialog } = await mountOpen(MonolithDialog, (d) =>
      d.open({ props: { mode: 'edit', width: '720px' } }),
    )

    const el = queryBodyMonolith()
    expect(el).toBeTruthy()
    expect(el?.getAttribute('data-width')).toBe('720px')
    expect(el?.getAttribute('data-title')).toBe('Factory')
    expect(el?.getAttribute('data-mode')).toBe('edit')
    expect(document.body.querySelector('motion-dialog')).toBeNull()
    expect(dialog.contentRef.value).toBeTruthy()
  })

  it('should keep BaseDialog shell for normal content', async () => {
    const Content = makeContent()
    await mountOpen(Content, (d) => d.open({ props: { message: 'hi' } }))

    expect(document.body.querySelector('motion-dialog')).toBeTruthy()
    expect(queryBodyMonolith()).toBeNull()
    expect(document.body.querySelector('.msg')?.textContent).toBe('hi')
  })

  it('should close monolith via closeOn and model update', async () => {
    const { dialog, wrapper } = await mountOpen(MonolithDialog)

    expect(dialog.visible).toBe(true)
    document.body.querySelector<HTMLButtonElement>('.success')?.click()
    await wrapper.vm.$nextTick()
    expect(dialog.visible).toBe(false)

    dialog.open()
    await flushPromises()
    document.body
      .querySelector<HTMLButtonElement>('.close-via-model')
      ?.click()
    await wrapper.vm.$nextTick()
    expect(dialog.visible).toBe(false)
  })

  it('should support createLayer(LayerNoContainer) directly', async () => {
    const useUnited = createLayer(LayerNoContainer, {
      props: { title: 'Direct', width: '400px' },
    })
    let dialog!: LayerInstance
    mount(
      defineComponent({
        setup() {
          dialog = useUnited(MonolithDialog, { closeOn: ['success'] })
          onMounted(() => dialog.open({ props: { mode: 'create' } }))
          return () => h('motion-host')
        },
      }),
    )
    await flushPromises()

    const el = queryBodyMonolith()
    expect(el?.getAttribute('data-title')).toBe('Direct')
    expect(el?.getAttribute('data-width')).toBe('400px')
    expect(el?.getAttribute('data-mode')).toBe('create')
  })

  it('should warn and render nothing when createLayer(LayerNoContainer) opens without content', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const useUnited = createLayer(LayerNoContainer)
    let dialog!: LayerInstance

    mount(
      defineComponent({
        setup() {
          dialog = useUnited()
          onMounted(() => dialog.open())
          return () => h('motion-host')
        },
      }),
    )
    await flushPromises()

    expect(dialog.visible).toBe(true)
    expect(queryBodyMonolith()).toBeNull()
    expect(document.body.querySelector('motion-dialog')).toBeNull()
    expect(spy).toHaveBeenCalledWith(
      '[vue-layerx] LayerNoContainer render skipped: content component is missing',
    )
    spy.mockRestore()
  })
})
