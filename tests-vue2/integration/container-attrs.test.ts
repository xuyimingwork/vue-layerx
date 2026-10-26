import { describe, expect, it, vi } from 'vitest'
import { createLayer } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import { makeContent, queryBodyDialog, ShellDialog } from '../fixtures/components'

describe('container $attrs passthrough (Vue 2.7)', () => {
  it('should forward undeclared container fields through $attrs and listeners through $listeners', async () => {
    const opened = vi.fn()
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(ShellDialog)(makeContent())
    })

    dialog.open({
      props: { message: 'hi' },
      container: {
        props: {
          title: 'Edit',
          width: '600px',
          'custom-class': 'wide',
          onOpened: opened,
        },
      },
    })
    await flushPromises()

    const el = queryBodyDialog()
    expect(el?.getAttribute('data-title')).toBe('Edit')
    expect(el?.getAttribute('data-width')).toBe('600px')
    expect(el?.getAttribute('data-custom-class')).toBe('wide')
    expect(el?.getAttribute('title')).toBeNull()
    expect(el?.getAttribute('width')).toBeNull()
    expect(el?.querySelector('.msg')?.textContent).toBe('hi')

    el?.querySelector<HTMLButtonElement>('.emit-opened')?.click()
    expect(opened).toHaveBeenCalledOnce()

    host.destroy()
  })
})
