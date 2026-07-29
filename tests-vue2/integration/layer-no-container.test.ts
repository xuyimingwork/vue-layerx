import { describe, expect, it, vi } from 'vitest'
import { createLayer, LayerNoContainer } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import {
  MonolithDialog,
  queryBodyDialog,
  queryBodyMonolith,
} from '../fixtures/components'

describe('LayerNoContainer (Vue 2.7)', () => {
  it('should project props via createLayer(LayerNoContainer)', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(LayerNoContainer, {
        props: { title: 'Direct', width: '400px' },
      })(MonolithDialog)
    })

    dialog.open({ props: { mode: 'create' } })
    await flushPromises()
    const el = queryBodyMonolith()
    expect(el?.getAttribute('data-title')).toBe('Direct')
    expect(el?.getAttribute('data-width')).toBe('400px')
    expect(el?.getAttribute('data-mode')).toBe('create')
    expect(queryBodyDialog()).toBeNull()

    document.body.querySelector<HTMLButtonElement>('.close-via-model')?.click()
    await flushPromises()
    expect(dialog.visible).toBe(false)
    host.destroy()
  })

  it('should render nothing when LayerNoContainer opens without content', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(LayerNoContainer)()
    })

    dialog.open()
    await flushPromises()
    expect(dialog.visible).toBe(true)
    expect(queryBodyMonolith()).toBeNull()
    expect(queryBodyDialog()).toBeNull()
    spy.mockRestore()
    host.destroy()
  })
})
