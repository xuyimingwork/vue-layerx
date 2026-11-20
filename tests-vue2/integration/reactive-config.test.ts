import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer, defineLayer } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import { Container, makeContent, queryBodyDialog } from '../fixtures/components'

describe('reactive layer config (Vue 2.7)', () => {
  it('should update content props from getter without re-open', async () => {
    const recordId = ref('a')
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent(), () => ({
        props: { message: recordId.value },
      }))
    })

    dialog.open()
    await flushPromises()
    expect(document.body.querySelector('.msg')?.textContent).toBe('a')

    recordId.value = 'b'
    await nextTick()
    await flushPromises()
    expect(document.body.querySelector('.msg')?.textContent).toBe('b')
    host.destroy()
  })

  it('should update container title from defineLayer getter without remounting content', async () => {
    const left = ref(3)
    let setupCount = 0
    let dialog!: ReturnType<ReturnType<typeof createLayer>>

    const Content = defineComponent({
      name: 'CountdownContent',
      setup() {
        setupCount++
        defineLayer(() => ({
          props: { title: `left-${left.value}` },
        }))
        return () => h('span', { class: 'msg' }, 'body')
      },
    })

    const host = mountSetup(() => {
      dialog = createLayer(Container)(Content)
    })

    dialog.open()
    await flushPromises()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('left-3')
    expect(setupCount).toBe(1)

    left.value = 2
    await nextTick()
    await flushPromises()
    expect(queryBodyDialog()?.getAttribute('data-title')).toBe('left-2')
    expect(setupCount).toBe(1)
    host.destroy()
  })
})
