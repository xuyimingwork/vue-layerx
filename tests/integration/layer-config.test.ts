import { ref } from 'vue'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { createLayer } from '@/index'
import { clearBody } from '@tests/helpers/dom'
import {
  AltContent,
  CloneMergeContent,
  DefineUseSlotContent,
  DrawerContainer,
  FlexibleModelContainer,
  ModeContent,
  ModelContainer,
  HeaderFooterContainer,
  RefChainContent,
  SlotContent,
  TieredModeContent,
  slotSpan,
} from '@tests/fixtures/layer-config'
import {
  clickBodyButton,
  closeViaModel,
  mountOpenLayer,
} from '@tests/helpers/layer-config-mount'
import {
  Container,
  makeContentWithDefineLayer,
  queryBodyDialog,
} from '@tests/fixtures/components'

describe('layer config', () => {
  afterEach(() => {
    clearBody()
  })

  describe('partial merge', () => {
    it('should keep non-conflicting container props from lower tiers when higher tier sets other keys', async () => {
      await mountOpenLayer(createLayer(Container, { props: { width: '480px' } }), {
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            container: { props: { title: 'Open title' } },
          }),
      })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Open title')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('480px')
    })

    it('should keep non-conflicting content props from lower tiers when higher tier sets other keys', async () => {
      await mountOpenLayer(
        createLayer(Container, { content: { props: { mode: 'view' } } }),
        {
          Content: ModeContent,
          open: (dialog) => dialog.open({ props: { message: 'hello' } }),
        },
      )

      expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
      expect(document.body.querySelector('.mode')?.textContent).toBe('view')
    })

    it('should accumulate container props across create, define, use, and open tiers', async () => {
      await mountOpenLayer(createLayer(Container, { props: { width: '400px' } }), {
        Content: makeContentWithDefineLayer({ props: { title: 'Defined title' } }),
        useConfig: { container: { props: { width: '640px' } } },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            container: { props: { title: 'Open title' } },
          }),
      })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Open title')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('640px')
    })

    it('should accumulate content props across create, define, use, and open tiers', async () => {
      await mountOpenLayer(createLayer(Container, { content: { props: { tone: 'muted' } } }), {
        Content: TieredModeContent,
        useConfig: { props: { mode: 'edit' } },
        open: (dialog) =>
          dialog.open({ props: { message: 'hello', locale: 'en' } }),
      })

      expect(document.body.querySelector('.msg')?.textContent).toBe('hello')
      expect(document.body.querySelector('.mode')?.textContent).toBe('edit')
      expect(document.body.querySelector('.tone')?.textContent).toBe('muted')
      expect(document.body.querySelector('.locale')?.textContent).toBe('en')
    })
  })

  describe('config shape', () => {
    it('should map createLayer top-level props to container', async () => {
      await mountOpenLayer(createLayer(Container, { props: { title: 'Create title' } }), {
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Create title')
    })

    it('should map createLayer content.props to content component', async () => {
      await mountOpenLayer(
        createLayer(Container, { content: { props: { message: 'Create message' } } }),
      )

      expect(document.body.querySelector('.msg')?.textContent).toBe('Create message')
    })

    it('should map open top-level props to content', async () => {
      await mountOpenLayer(createLayer(Container), {
        open: (dialog) => dialog.open({ props: { message: 'Open message' } }),
      })

      expect(document.body.querySelector('.msg')?.textContent).toBe('Open message')
    })

    it('should map open container block to container', async () => {
      await mountOpenLayer(createLayer(Container), {
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            container: { props: { title: 'Open container title' } },
          }),
      })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Open container title')
    })

    it('should map use top-level props to content and use.container to container', async () => {
      await mountOpenLayer(createLayer(Container), {
        useConfig: {
          props: { message: 'Use message' },
          container: { props: { title: 'Use container title' } },
        },
      })

      expect(document.body.querySelector('.msg')?.textContent).toBe('Use message')
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Use container title')
    })
  })

  describe('container model', () => {
    it('should bind default modelValue to visible and close when model becomes false', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(ModelContainer), {
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(queryBodyDialog()).toBeTruthy()
      await closeViaModel(wrapper)

      expect(queryBodyDialog()).toBeFalsy()
      expect(dialog.visible).toBe(false)
    })

    it('should close when model update is emitted without a value', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(ModelContainer), {
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(queryBodyDialog()).toBeTruthy()
      await clickBodyButton('close-via-model-empty', wrapper)

      expect(queryBodyDialog()).toBeFalsy()
      expect(dialog.visible).toBe(false)
    })

    it('should let open-tier model win over use and define tiers', async () => {
      const { dialog, wrapper } = await mountOpenLayer(createLayer(FlexibleModelContainer), {
        Content: makeContentWithDefineLayer({ model: 'panelOpen' }),
        useConfig: { container: { model: 'drawerOpen' } },
        open: (dialog) =>
          dialog.open({
            props: { message: 'hi' },
            container: { model: 'open' },
          }),
      })

      expect(queryBodyDialog()?.getAttribute('data-model')).toBe('open')
      await closeViaModel(wrapper)

      expect(queryBodyDialog()).toBeFalsy()
      expect(dialog.visible).toBe(false)
    })

    it('should call user onUpdate handler before closing via model', async () => {
      const onUpdate = vi.fn()
      const { wrapper } = await mountOpenLayer(
        createLayer(ModelContainer, { props: { 'onUpdate:modelValue': onUpdate } }),
        { open: (dialog) => dialog.open({ props: { message: 'hi' } }) },
      )

      await closeViaModel(wrapper)

      expect(onUpdate).toHaveBeenCalledWith(false)
      expect(queryBodyDialog()).toBeFalsy()
    })
  })

  describe('component override', () => {
    it('should render use-tier container.component override', async () => {
      await mountOpenLayer(createLayer(Container), {
        useConfig: {
          container: { component: DrawerContainer, props: { size: '70vw' } },
        },
        open: (dialog) => dialog.open({ props: { message: 'drawer' } }),
      })

      expect(document.body.querySelector('motion-drawer')).toBeTruthy()
      expect(document.body.querySelector('motion-dialog')).toBeNull()
      expect(document.body.querySelector('motion-drawer')?.getAttribute('data-size')).toBe('70vw')
    })

    it('should render open-tier content.component override', async () => {
      await mountOpenLayer(createLayer(Container), {
        open: (dialog) =>
          dialog.open({ component: AltContent, props: { message: 'alt' } }),
      })

      expect(document.body.querySelector('.alt-content')?.textContent).toBe('alt')
      expect(document.body.querySelector('.msg')).toBeNull()
    })

    it('should keep create container when open overrides only content component', async () => {
      await mountOpenLayer(createLayer(Container, { props: { title: 'Shell title' } }), {
        open: (dialog) =>
          dialog.open({ component: AltContent, props: { message: 'alt' } }),
      })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Shell title')
      expect(document.body.querySelector('.alt-content')?.textContent).toBe('alt')
    })
  })

  describe('slots', () => {
    it('should keep content in container default when container.slots.default is set', async () => {
      await mountOpenLayer(
        createLayer(Container, {
          slots: {
            default: slotSpan('hijack-default', 'hijacked'),
            footer: slotSpan('slot-footer', 'create footer'),
          },
        }),
        {
          open: (dialog) =>
            dialog.open({
              props: { message: 'hi' },
              container: {
                slots: { default: slotSpan('open-hijack-default', 'open hijacked') },
              },
            }),
        },
      )

      expect(document.body.querySelector('.msg')?.textContent).toBe('hi')
      expect(document.body.querySelector('.hijack-default')).toBeNull()
      expect(document.body.querySelector('.open-hijack-default')).toBeNull()
      expect(document.body.querySelector('.slot-footer')?.textContent).toBe('create footer')
    })

    it('should render different container slot names from multiple tiers', async () => {
      await mountOpenLayer(
        createLayer(HeaderFooterContainer, {
          slots: { footer: slotSpan('slot-footer', 'create footer') },
        }),
        {
          open: (dialog) =>
            dialog.open({
              props: { message: 'hi' },
              container: { slots: { header: slotSpan('slot-header', 'open header') } },
            }),
        },
      )

      expect(document.body.querySelector('.slot-footer')?.textContent).toBe('create footer')
      expect(document.body.querySelector('.slot-header')?.textContent).toBe('open header')
    })

    it('should keep container and content slots separate when names match', async () => {
      await mountOpenLayer(
        createLayer(Container, {
          slots: { footer: slotSpan('container-footer', 'container footer') },
          content: { slots: { footer: slotSpan('content-footer', 'content footer') } },
        }),
        {
          Content: SlotContent,
          open: (dialog) => dialog.open({ props: { message: 'hi' } }),
        },
      )

      expect(document.body.querySelector('.container-footer')?.textContent).toBe(
        'container footer',
      )
      expect(document.body.querySelector('.content-footer')?.textContent).toBe('content footer')
    })

    it('should apply define container slot and use content slot independently', async () => {
      await mountOpenLayer(createLayer(Container), {
        Content: DefineUseSlotContent,
        useConfig: { slots: { extra: slotSpan('use-extra', 'use extra') } },
        open: (dialog) => dialog.open({ props: { message: 'hi' } }),
      })

      expect(document.body.querySelector('.define-footer')?.textContent).toBe('define footer')
      expect(document.body.querySelector('.use-extra')?.textContent).toBe('use extra')
    })
  })

  describe('props.ref', () => {
    it('should chain use-tier and open-tier content props.ref onto same instance', async () => {
      const useRef = ref<unknown>(null)
      const openRef = ref<unknown>(null)

      const { dialog } = await mountOpenLayer(createLayer(Container), {
        Content: RefChainContent,
        useConfig: { props: { ref: useRef } },
        open: (dialog) =>
          dialog.open({ props: { message: 'hi', ref: openRef } }),
      })

      expect(useRef.value).toBe(dialog.content)
      expect(openRef.value).toBe(dialog.content)
      expect((dialog.content as { marker?: string } | null)?.marker).toBe('content')
    })
  })

  describe('clone defaults', () => {
    it('should fold clone config into use tier and merge non-conflicting fields', async () => {
      const { wrapper } = await mountOpenLayer(createLayer(Container), {
        Content: CloneMergeContent,
        useConfig: { props: { mode: 'view' } },
        open: (dialog) => {
          const cloned = dialog.clone({ closeOn: ['done'] })
          cloned.open({ props: { message: 'cloned' } })
        },
      })

      expect(document.body.querySelector('.msg')?.textContent).toBe('cloned')
      expect(document.body.querySelector('.mode')?.textContent).toBe('view')

      await clickBodyButton('done', wrapper)
      expect(queryBodyDialog()).toBeFalsy()
    })

    it('should accumulate clone container props with open container props', async () => {
      await mountOpenLayer(createLayer(Container), {
        open: (dialog) => {
          const cloned = dialog.clone({ container: { props: { width: '720px' } } })
          cloned.open({
            props: { message: 'hi' },
            container: { props: { title: 'Clone open title' } },
          })
        },
      })

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Clone open title')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('720px')
    })
  })
})
