import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  createLayer,
  LayerConfirmError,
  type LayerInstance,
} from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { closeViaModel } from '@tests/helpers/layer-config-mount'
import {
  Container,
  makeContent,
  makeContentWithDefineLayer,
  queryBodyDialog,
} from '@tests/fixtures/components'
import { ModelContainer } from '@tests/fixtures/layer-config'

const PayloadContent = defineComponent({
  name: 'PayloadContent',
  props: { message: String },
  emits: ['done', 'cancel'],
  setup(props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h(
          'button',
          {
            class: 'done',
            onClick: () => emit('done', { action: 'delete' }),
          },
          'done',
        ),
        h('button', { class: 'cancel', onClick: () => emit('cancel') }, 'cancel'),
      ])
  },
})

const GateContent = defineComponent({
  name: 'GateContent',
  emits: ['done'],
  setup(_props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('button', { class: 'done-ok', onClick: () => emit('done', true) }, 'ok'),
        h('button', { class: 'done-no', onClick: () => emit('done', false) }, 'no'),
      ])
  },
})

function mountConfirmHost(
  useLayer: ReturnType<typeof createLayer>,
  setupDialog: (useLayer: ReturnType<typeof createLayer>) => LayerInstance,
) {
  let dialog!: LayerInstance
  const wrapper = mount(
    defineComponent({
      setup() {
        dialog = setupDialog(useLayer)
        return () => h('motion-host')
      },
    }),
  )
  return { dialog, wrapper }
}

describe('LayerInstance.confirm', () => {
  describe('resolve and reject', () => {
    it('should resolve when closeOn confirmed content emit fires', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(Content, {
          closeOn: { done: { when: 'always', confirmed: true } },
        }),
      )

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
        args: [],
        data: undefined,
      })
      expect(dialog.visible).toBe(false)
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should resolve with args and data when confirmed content emit carries payload', async () => {
      const useLayer = createLayer(Container)
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(PayloadContent, {
          closeOn: { done: { when: 'always', confirmed: true } },
        }),
      )

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      await expect(promise).resolves.toEqual({
        source: 'content',
        event: 'done',
        args: [{ action: 'delete' }],
        data: { action: 'delete' },
      })
    })

    it('should reject with code close when closeOn confirmed is false', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(Content, {
          closeOn: { cancel: { when: 'always', confirmed: false } },
        }),
      )

      const promise = dialog.confirm({ props: { message: 'ask' } })
      const settled = promise.then(
        () => null,
        (e) => e,
      )
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.cancel')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      const error = await settled
      expect(error).toBeInstanceOf(LayerConfirmError)
      expect(error).toMatchObject({
        code: 'close',
        result: { source: 'content', event: 'cancel' },
      })
    })

    it('should reject with code close when array-sugar closeOn event is emitted', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(Content, { closeOn: ['cancel'] }),
      )

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'content', event: 'cancel' },
      })
      document.body.querySelector<HTMLButtonElement>('.cancel')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()
      await assertion
    })

    it('should resolve via close({ confirmed: true })', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

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
    })

    it('should reject with code close when close is called without confirmed', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'instance', args: [], data: undefined },
      })
      dialog.close()
      await assertion
      expect(dialog.visible).toBe(false)
    })

    it('should reject with source container when container model updates to false', async () => {
      const useLayer = createLayer(ModelContainer)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()
      expect(queryBodyDialog()).toBeTruthy()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: {
          source: 'container',
          event: 'update:modelValue',
        },
      })
      await closeViaModel(wrapper)
      await flushPromises()
      await assertion
      expect(dialog.visible).toBe(false)
    })
  })

  describe('mutual exclusion', () => {
    it('should reject busy when already open', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      dialog.open({ props: { message: 'open' } })
      await flushPromises()

      await expect(dialog.confirm()).rejects.toMatchObject({ code: 'busy' })
      expect(dialog.visible).toBe(true)
    })

    it('should reject busy when confirming again', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const first = dialog.confirm({ props: { message: 'ask' } })
      await expect(dialog.confirm()).rejects.toMatchObject({ code: 'busy' })

      dialog.close({ confirmed: true })
      await first
    })

    it('should ignore open while confirming', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'a' } })
      await flushPromises()

      dialog.open({ props: { message: 'b' } })
      expect(warn).toHaveBeenCalled()
      expect(document.body.querySelector('.msg')?.textContent).toBe('a')

      dialog.close({ confirmed: true })
      await promise
      warn.mockRestore()
    })
  })

  describe('lifecycle', () => {
    it('should reject with source unmount when host unmounts while confirming', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'unmount', args: [], data: undefined },
      })
      wrapper.unmount()
      await assertion
    })

    it('should reject with source unmount when unmount is called while confirming', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      const assertion = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'unmount', args: [], data: undefined },
      })
      dialog.unmount()
      await assertion
    })

    it('should allow confirm again after previous confirm settles', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(Content, {
          closeOn: { done: { when: 'always', confirmed: true } },
        }),
      )

      const first = dialog.confirm({ props: { message: 'first' } })
      await flushPromises()
      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()
      await first

      const second = dialog.confirm({ props: { message: 'second' } })
      await flushPromises()
      expect(document.body.querySelector('.msg')?.textContent).toBe('second')
      expect(dialog.visible).toBe(true)

      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()
      await expect(second).resolves.toMatchObject({ source: 'content', event: 'done' })
    })

    it('should allow open after previous confirm settles', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()
      dialog.close()
      await expect(promise).rejects.toBeInstanceOf(LayerConfirmError)

      dialog.open({ props: { message: 'after' } })
      await flushPromises()
      expect(dialog.visible).toBe(true)
      expect(document.body.querySelector('.msg')?.textContent).toBe('after')
    })
  })

  describe('config', () => {
    it('should resolve when define-tier closeOn sets confirmed true', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContentWithDefineLayer({
        content: {
          closeOn: { done: { when: 'always', confirmed: true } },
        },
      })
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
      })
    })

    it('should resolve when open-tier patches closeOn confirmed over use-tier array sugar', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(Content, { closeOn: ['done'] }),
      )

      const promise = dialog.confirm({
        props: { message: 'ask' },
        closeOn: { done: { when: 'always', confirmed: true } },
      })
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.done')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
      })
    })

    it('should mount confirm open config props before settle', async () => {
      const useLayer = createLayer(Container)
      const Content = makeContent()
      const { dialog } = mountConfirmHost(useLayer, (ul) => ul(Content))

      const promise = dialog.confirm({ props: { message: 'ask-me' } })
      await flushPromises()

      expect(queryBodyDialog()).toBeTruthy()
      expect(document.body.querySelector('.msg')?.textContent).toBe('ask-me')

      dialog.close({ confirmed: true })
      await promise
    })

    it('should not close when closeOn when function returns false', async () => {
      const useLayer = createLayer(Container)
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(GateContent, {
          closeOn: {
            done: { when: (ok) => ok === true, confirmed: true },
          },
        }),
      )

      const promise = dialog.confirm()
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.done-no')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      expect(dialog.visible).toBe(true)
      expect(queryBodyDialog()).toBeTruthy()

      dialog.close({ confirmed: true })
      await promise
    })

    it('should resolve when closeOn when function returns true and confirmed is true', async () => {
      const useLayer = createLayer(Container)
      const { dialog, wrapper } = mountConfirmHost(useLayer, (ul) =>
        ul(GateContent, {
          closeOn: {
            done: { when: (ok) => ok === true, confirmed: true },
          },
        }),
      )

      const promise = dialog.confirm()
      await flushPromises()

      document.body.querySelector<HTMLButtonElement>('.done-ok')?.click()
      await wrapper.vm.$nextTick()
      await flushPromises()

      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
        args: [true],
        data: true,
      })
      expect(dialog.visible).toBe(false)
    })
  })
})
