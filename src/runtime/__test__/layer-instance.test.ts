import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { flushPromises, withoutDom } from '@tests/helpers/dom'
import { Container, makeContent } from '@tests/fixtures/components'
import { resolveTemplateTo } from '@/shared/layer-template-to'
import { LayerConfirmError } from '@/shared/layer-confirm-error'
import { createLayerInstance } from '../layer-instance'

function makeInstance(closeOn?: Record<string, unknown>) {
  return createLayerInstance({
    create: computed(() => ({ container: { component: Container } })),
    use: computed(() => ({
      content: {
        component: makeContent(),
        ...(closeOn ? { closeOn: closeOn as never } : {}),
      },
    })),
  })
}

describe('createLayerInstance', () => {
  describe('SSR', () => {
    it('should not throw when open is called without DOM', () => {
      withoutDom(() => {
        const instance = makeInstance()
        expect(() => instance.open({ props: { message: 'ssr' } })).not.toThrow()
        expect(instance.visible.value).toBe(true)
        expect(() => instance.unmount()).not.toThrow()
      })
    })

    it('should mount on client when open is called without DOM then visible toggles after hydration', async () => {
      const originalDocument = globalThis.document
      vi.stubGlobal('document', undefined)

      const instance = makeInstance()
      instance.open({ props: { message: 'deferred' } })

      vi.stubGlobal('document', originalDocument)
      instance.close()
      instance.open({ props: { message: 'deferred' } })

      await flushPromises()

      expect(document.body.querySelector('motion-dialog')).toBeTruthy()
      expect(document.body.querySelector('.msg')?.textContent).toBe('deferred')
      instance.unmount()
    })
  })

  describe('template handler', () => {
    it('should attach template handler that returns null local render', () => {
      const instance = makeInstance()

      const content = resolveTemplateTo(instance).template({
        name: 'extra',
        container: false,
        render: () => 'vnode',
      })

      expect(content.render()).toBeNull()
    })
  })

  describe('confirm', () => {
    it('should resolve when closeOn confirmed content emit fires', async () => {
      const instance = makeInstance({
        done: { when: 'always', confirmed: true },
      })
      const promise = instance.confirm({ props: { message: 'ask' } })
      await flushPromises()

      ;(document.body.querySelector('.done') as HTMLButtonElement | null)?.click()
      await flushPromises()

      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
        args: [],
        data: undefined,
      })
      expect(instance.visible.value).toBe(false)
      instance.unmount()
    })

    it('should reject with code close when confirmed is false', async () => {
      const instance = makeInstance({
        cancel: { when: 'always', confirmed: false },
      })
      const promise = instance.confirm()
      await flushPromises()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'content', event: 'cancel' },
      })
      ;(document.body.querySelector('.cancel') as HTMLButtonElement | null)?.click()
      await flushPromises()
      await assertion
      instance.unmount()
    })

    it('should resolve via close({ confirmed: true })', async () => {
      const instance = makeInstance()
      const promise = instance.confirm()
      await flushPromises()

      instance.close({ confirmed: true, args: [{ id: 1 }] })

      await expect(promise).resolves.toEqual({
        source: 'instance',
        event: undefined,
        args: [{ id: 1 }],
        data: { id: 1 },
      })
      instance.unmount()
    })

    it('should reject with source unmount on unmount', async () => {
      const instance = makeInstance()
      const promise = instance.confirm()
      await flushPromises()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'unmount', args: [], data: undefined },
      })
      instance.unmount()
      await assertion
    })

    it('should reject busy when already open', async () => {
      const instance = makeInstance()
      instance.open()
      await expect(instance.confirm()).rejects.toMatchObject({ code: 'busy' })
      instance.unmount()
    })

    it('should reject busy when confirming again', async () => {
      const instance = makeInstance()
      const first = instance.confirm()
      await expect(instance.confirm()).rejects.toMatchObject({ code: 'busy' })
      instance.close({ confirmed: true })
      await first
      instance.unmount()
    })

    it('should ignore open while confirming', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const instance = makeInstance()
      const promise = instance.confirm({ props: { message: 'a' } })
      await flushPromises()

      instance.open({ props: { message: 'b' } })
      expect(warn).toHaveBeenCalled()
      expect(document.body.querySelector('.msg')?.textContent).toBe('a')

      instance.close({ confirmed: true })
      await promise
      warn.mockRestore()
      instance.unmount()
    })

    it('should be instanceof LayerConfirmError on reject', async () => {
      const instance = makeInstance()
      const promise = instance.confirm()
      const settled = promise.then(
        () => null,
        (e) => e,
      )
      instance.close()
      const error = await settled
      expect(error).toBeInstanceOf(LayerConfirmError)
      expect((error as LayerConfirmError).code).toBe('close')
      instance.unmount()
    })
  })
})
