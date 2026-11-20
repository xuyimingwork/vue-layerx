import { describe, expect, it } from 'vitest'
import { createLayer, LayerConfirmError } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import { Container, makeContent, queryBodyDialog } from '../fixtures/components'

describe('LayerInstance.confirm (Vue 2.7)', () => {
  it('should resolve when closeOn confirmed content emit fires', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent(), {
        closeOn: { done: { when: 'always', confirmed: true } },
      })
    })

    const promise = dialog.confirm({ props: { message: 'ask' } })
    await flushPromises()
    expect(queryBodyDialog()).toBeTruthy()

    document.body.querySelector<HTMLButtonElement>('.done')?.click()
    await flushPromises()

    await expect(promise).resolves.toMatchObject({
      source: 'content',
      event: 'done',
    })
    expect(dialog.visible).toBe(false)
    expect(queryBodyDialog()).toBeFalsy()
    host.destroy()
  })

  it('should reject with code close when closeOn confirmed is false', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent(), {
        closeOn: { cancel: { when: 'always', confirmed: false } },
      })
    })

    const promise = dialog.confirm({ props: { message: 'ask' } })
    const settled = promise.then(
      () => null,
      (e) => e,
    )
    await flushPromises()

    document.body.querySelector<HTMLButtonElement>('.cancel')?.click()
    await flushPromises()

    const error = await settled
    expect(error).toBeInstanceOf(LayerConfirmError)
    expect(error).toMatchObject({
      code: 'close',
      result: { source: 'content', event: 'cancel' },
    })
    expect(dialog.visible).toBe(false)
    host.destroy()
  })

  it('should resolve via close({ confirmed: true })', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent())
    })

    const promise = dialog.confirm({ props: { message: 'ask' } })
    await flushPromises()

    dialog.close({ confirmed: true, args: [{ id: 1 }] })

    await expect(promise).resolves.toEqual({
      source: 'instance',
      event: undefined,
      args: [{ id: 1 }],
      data: { id: 1 },
    })
    expect(dialog.visible).toBe(false)
    host.destroy()
  })

  it('should reject with code close when close is called without confirmed', async () => {
    let dialog!: ReturnType<ReturnType<typeof createLayer>>
    const host = mountSetup(() => {
      dialog = createLayer(Container)(makeContent())
    })

    const promise = dialog.confirm({ props: { message: 'ask' } })
    await flushPromises()

    const assertion = expect(promise).rejects.toMatchObject({
      code: 'close',
      result: { source: 'instance', args: [], data: undefined },
    })
    dialog.close()
    await assertion
    expect(dialog.visible).toBe(false)
    host.destroy()
  })
})
