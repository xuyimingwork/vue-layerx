import { describe, expect, it } from 'vitest'
import { createLayer } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import { Container, makeContent, queryBodyDialog } from '../fixtures/components'

describe('layer config closeOn (Vue 2.7)', () => {
  it('should close when use-tier closeOn lists the event', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent(), { closeOn: ['done'] })
    })

    dialog.open({ props: { message: 'hi' } })
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()

    document.body.querySelector<HTMLButtonElement>('.cancel')?.click()
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()

    document.body.querySelector<HTMLButtonElement>('.done')?.click()
    await flushPromises()
    expect(queryBodyDialog()).toBeFalsy()
    host.destroy()
  })

  it('should close when open-tier closeOn lists the event', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent())
    })

    dialog.open({ props: { message: 'hi' }, closeOn: ['done'] })
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()

    document.body.querySelector<HTMLButtonElement>('.cancel')?.click()
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()

    document.body.querySelector<HTMLButtonElement>('.done')?.click()
    await flushPromises()
    expect(queryBodyDialog()).toBeFalsy()
    host.destroy()
  })
})
