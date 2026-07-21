import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { createLayer, LayerConfirmError } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import {
  clickBodyButton,
  mountOpenLayer,
} from '@tests/helpers/layer-config-mount'
import {
  Container,
  makeContent,
  queryBodyDialog,
} from '@tests/fixtures/components'
import {
  HandlerContent,
  SubmitContent,
  makeSubmitContentWithDefineLayer,
} from '@tests/fixtures/layer-config'

const GateContent = defineComponent({
  name: 'GateContent',
  emits: ['done'],
  setup(_props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('button', { class: 'done-ok', onClick: () => emit('done', true) }, 'ok'),
        h('button', { class: 'done-no', onClick: () => emit('done', false) }, 'no'),
        h('button', { class: 'done-truthy', onClick: () => emit('done', 1) }, 'truthy'),
      ])
  },
})

const NoneEventContent = defineComponent({
  name: 'NoneEventContent',
  props: { message: String },
  emits: ['none', 'done'],
  setup(props, { emit }) {
    return () =>
      h('motion-div', { class: 'content' }, [
        h('span', { class: 'msg' }, props.message),
        h('button', { class: 'none', onClick: () => emit('none') }, 'none'),
        h('button', { class: 'done', onClick: () => emit('done') }, 'done'),
      ])
  },
})

async function clickAndFlush(
  wrapper: Awaited<ReturnType<typeof mountOpenLayer>>['wrapper'],
  className: string,
) {
  await clickBodyButton(className, wrapper)
  await flushPromises()
}

describe('layer config closeOn', () => {
  describe('declaration sites', () => {
    it('should close when defineLayer content.closeOn lists the event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: makeSubmitContentWithDefineLayer(['submit']),
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'submit')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close when use-tier closeOn lists the event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'submit')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close when open-tier closeOn lists the event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        open: (dialog) =>
          dialog.open({ props: { message: 'hi' }, closeOn: ['done'] }),
      })

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close when clone-tier closeOn lists the event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        open: (dialog) => {
          const cloned = dialog.clone({ closeOn: ['done'] })
          cloned.open({ props: { message: 'cloned' } })
        },
      })

      await clickAndFlush(wrapper, 'submit')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close when create-tier content.closeOn lists the event', async () => {
      const { wrapper } = await mountOpenLayer(
        createLayer(Container, { content: { closeOn: ['done'] } }),
        {
          Content: SubmitContent,
          open: (dialog) => dialog.open({ props: { message: 'hi' } }),
        },
      )

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })
  })

  describe('array sugar', () => {
    it('should close on string events in array sugar', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done', 'cancel'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'submit')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()

      const again = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done', 'cancel'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })
      await clickAndFlush(again.wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should treat bare string none as an event name not a tombstone', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: NoneEventContent,
        useConfig: { closeOn: ['none'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'none')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close when array object entry uses when always', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: [{ event: 'done', when: 'always' }] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should not close when array object entry uses when none over a lower event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            closeOn: [{ event: 'done', when: 'none' }],
          }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()
    })

    it('should gate close when array object entry uses when function', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: {
          closeOn: [{ event: 'done', when: (ok) => ok === true }],
        },
        open: (dialog) => dialog.open(),
      })

      await clickAndFlush(wrapper, 'done-no')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done-ok')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should let later array entry win for the same event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: ['done', { event: 'done', when: () => false }],
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()
    })
  })

  describe('record sugar', () => {
    it('should close when record value is true', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: { done: true } },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close when record value is always', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: { done: 'always' } },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should remove event when record value is false', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            closeOn: { done: false, cancel: true },
          }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should remove event when record value is none', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done', 'cancel'] },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            closeOn: { done: 'none' },
          }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should gate close when record value is a when function', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: { closeOn: { done: (ok) => ok === true } },
        open: (dialog) => dialog.open(),
      })

      await clickAndFlush(wrapper, 'done-no')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done-ok')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should apply policy object when and confirmed', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: HandlerContent,
        useConfig: {
          closeOn: { done: { when: 'always', confirmed: true } },
        },
        open: () => {},
      })

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      await clickAndFlush(wrapper, 'done')
      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
      })
      expect(queryBodyDialog()).toBeFalsy()
    })
  })

  describe('when', () => {
    it('should always close when when is always', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: { closeOn: { done: { when: 'always' } } },
        open: (dialog) => dialog.open(),
      })

      await clickAndFlush(wrapper, 'done-no')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should close only when when function returns true', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: {
          closeOn: { done: { when: (ok) => ok === true } },
        },
        open: (dialog) => dialog.open(),
      })

      await clickAndFlush(wrapper, 'done-no')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done-ok')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should not close when when function returns a truthy non-true value', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: {
          closeOn: {
            done: { when: (ok) => (ok ? (1 as unknown as boolean) : false) },
          },
        },
        open: (dialog) => dialog.open(),
      })

      await clickAndFlush(wrapper, 'done-truthy')
      expect(queryBodyDialog()).toBeTruthy()
    })

    it('should keep layer open when emitted event is absent from closeOn', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['cancel'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()
    })
  })

  describe('confirmed', () => {
    it('should close on open path regardless of confirmed', async () => {
      for (const confirmed of [true, false] as const) {
        const { wrapper } = await mountOpenLayer(createLayer(Container), {
          Content: HandlerContent,
          useConfig: {
            closeOn: { done: { when: 'always', confirmed } },
          },
          open: (dialog) => dialog.open({ props: { message: 'hi' } }),
        })

        await clickAndFlush(wrapper, 'done')
        expect(queryBodyDialog()).toBeFalsy()
      }
    })

    it('should resolve confirm when confirmed is true', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: makeContent(),
        useConfig: {
          closeOn: { done: { when: 'always', confirmed: true } },
        },
        open: () => {},
      })

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      await clickAndFlush(wrapper, 'done')
      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
      })
      expect(dialog.visible).toBe(false)
    })

    it('should reject confirm with code close when confirmed is false', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: makeContent(),
        useConfig: {
          closeOn: { cancel: { when: 'always', confirmed: false } },
        },
        open: () => {},
      })

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      const rejection = expect(promise).rejects.toMatchObject({
        code: 'close',
        result: { source: 'content', event: 'cancel' },
      })
      await clickAndFlush(wrapper, 'cancel')
      await rejection
      await expect(promise).rejects.toBeInstanceOf(LayerConfirmError)
      expect(dialog.visible).toBe(false)
    })

    it('should reject confirm with code close when array sugar closes', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: makeContent(),
        useConfig: { closeOn: ['cancel'] },
        open: () => {},
      })

      const promise = dialog.confirm({ props: { message: 'ask' } })
      await flushPromises()

      const rejection = expect(promise).rejects.toMatchObject({ code: 'close' })
      await clickAndFlush(wrapper, 'cancel')
      await rejection
      expect(dialog.visible).toBe(false)
    })

    it('should resolve confirm when open patches confirmed true over use array sugar', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: makeContent(),
        useConfig: { closeOn: ['done'] },
        open: () => {},
      })

      const promise = dialog.confirm({
        props: { message: 'ask' },
        closeOn: { done: { when: 'always', confirmed: true } },
      })
      await flushPromises()

      await clickAndFlush(wrapper, 'done')
      await expect(promise).resolves.toMatchObject({
        source: 'content',
        event: 'done',
      })
    })
  })

  describe('cross-tier patch', () => {
    it('should keep lower events when upper only adds another', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: makeSubmitContentWithDefineLayer(['submit']),
        useConfig: { closeOn: ['done'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'submit')
      expect(queryBodyDialog()).toBeFalsy()

      const again = await mountOpenLayer(createLayer(Container), {
        Content: makeSubmitContentWithDefineLayer(['submit']),
        useConfig: { closeOn: ['done'] },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })
      await clickAndFlush(again.wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should keep lower closeOn events when open only adds another', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) =>
          dialog.open({ props: { message: 'hi' }, closeOn: ['cancel'] }),
      })

      await clickAndFlush(wrapper, 'submit')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeFalsy()

      const again = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) =>
          dialog.open({ props: { message: 'hi' }, closeOn: ['cancel'] }),
      })
      await clickAndFlush(again.wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should replace whole entry when upper patches the same event', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: { closeOn: { done: { when: 'always' } } },
        open: (dialog) =>
          dialog.open({
            closeOn: { done: { when: () => false } },
          }),
      })

      await clickAndFlush(wrapper, 'done-ok')
      expect(queryBodyDialog()).toBeTruthy()
    })

    it('should remove a lower closeOn event with false', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            closeOn: { done: false, cancel: true },
          }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should remove a lower closeOn event with when none', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: { closeOn: ['done', 'cancel'] },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            closeOn: { done: { when: 'none', confirmed: false } },
          }),
      })

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
    })
  })

  describe('with props.onXxx', () => {
    it('should call props handler then close when when allows', async () => {
      const onDone = vi.fn()
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: HandlerContent,
        useConfig: { closeOn: ['done'] },
        open: (dialog) =>
          dialog.open({ props: { message: 'hi', onDone } }),
      })

      await clickAndFlush(wrapper, 'done')

      expect(onDone).toHaveBeenCalled()
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should call props handler and keep open when when returns false', async () => {
      const onDone = vi.fn()
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: GateContent,
        useConfig: {
          closeOn: { done: { when: () => false } },
        },
        open: (dialog) => dialog.open({ props: { onDone } }),
      })

      await clickAndFlush(wrapper, 'done-ok')

      expect(onDone).toHaveBeenCalled()
      expect(queryBodyDialog()).toBeTruthy()
    })
  })

  describe('invalid closeOn', () => {
    it('should warn and ignore policy object without when while keeping sibling events', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: {
            done: { confirmed: true } as never,
            cancel: true,
          },
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('object entry requires when'),
      )

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
      warn.mockRestore()
    })

    it('should warn and ignore policy object with invalid when while keeping sibling events', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: {
            done: { when: 'sometimes' as never },
            cancel: true,
          },
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('invalid when'),
      )

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
      warn.mockRestore()
    })

    it('should warn and ignore array entry with empty event while keeping string events', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: [{ event: '', when: 'always' }, 'cancel'] as never,
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('array entry missing event'),
      )

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
      warn.mockRestore()
    })

    it('should warn and ignore invalid array entries while keeping string events', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: [123, 'cancel'] as never,
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('array entry invalid'),
      )

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
      warn.mockRestore()
    })

    it('should warn and ignore invalid record values while keeping sibling events', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: { done: 1, cancel: true } as never,
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('invalid value'),
      )

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()

      await clickAndFlush(wrapper, 'cancel')
      expect(queryBodyDialog()).toBeFalsy()
      warn.mockRestore()
    })

    it('should warn and ignore non-array non-object closeOn entirely', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: SubmitContent,
        useConfig: {
          closeOn: 'done' as never,
        },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('closeOn: invalid value'),
      )

      await clickAndFlush(wrapper, 'done')
      expect(queryBodyDialog()).toBeTruthy()
      warn.mockRestore()
    })
  })
})
