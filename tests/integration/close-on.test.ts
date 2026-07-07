import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer } from '@/index'
import type { LayerInstance } from '@/types'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

describe('createLayer / closeOn', () => {
  it('should close layer when use-tier closeOn event is emitted', async () => {
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
    await flushPromises()

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })

  it('should close layer when open-tier closeOn is set without use-tier closeOn', async () => {
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
    await flushPromises()

    const done = document.body.querySelector('.done') as HTMLButtonElement
    done?.click()
    await wrapper.vm.$nextTick()
    expect(queryBodyDialog()).toBeFalsy()
  })
})
