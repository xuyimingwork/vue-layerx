import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import type { LayerConfigFragment } from '@/types/config'
import {
  mergeFragment,
  toFragmentFromContent,
  toFragmentFromContainer,
} from '@/config/fragment'
import { createLayerStore } from '@/runtime/layer-store'

function slotMarker(_label: string) {
  return () => null as never
}

function defineFragment(
  viewStore: ReturnType<typeof createDefineStore>,
  fragment: LayerConfigFragment,
) {
  return viewStore.setup('define', computed(() => fragment)).template
}

function createDefineStore() {
  return createLayerStore({})
}

function createTestInstanceStore(overrides: {
  create?: LayerConfigFragment
  use?: LayerConfigFragment
  open?: LayerConfigFragment
} = {}) {
  const store = createLayerStore({
    create: computed(() => overrides.create ?? {}),
    open: overrides.open ?? {},
    refs: {},
  })
  const { template } = store.setup(
    'use',
    computed(() => overrides.use ?? {}),
  )
  return Object.assign(store, { template })
}

function mergeLayerStores(
  instanceStore: ReturnType<typeof createTestInstanceStore>,
  viewStore: ReturnType<typeof createDefineStore>,
) {
  const fragment = mergeFragment(
    instanceStore.create,
    viewStore['define:template'],
    viewStore.define,
    instanceStore['use:template'],
    instanceStore.use,
    instanceStore.open,
  )
  return {
    container: fragment.container ?? {},
    content: fragment.content ?? {},
  }
}

describe('layer store merge', () => {
  it('should merge container props with priority open > use > define > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromContainer({ props: { title: 'Create', width: '400px' } }),
      use: toFragmentFromContent({ container: { props: { width: '640px' } } }),
      open: toFragmentFromContent({ container: { props: { title: 'Open' } } }),
    })
    const viewStore = createDefineStore()
    defineFragment(viewStore, toFragmentFromContainer({ props: { title: 'Defined' } }))

    const merged = mergeLayerStores(instanceStore, viewStore)

    expect(merged.container.props).toEqual({ title: 'Open', width: '640px' })
  })

  it('should merge content props with priority open > use > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromContainer({ content: { props: { message: 'create' } } }),
      use: toFragmentFromContent({ props: { message: 'use' } }),
      open: toFragmentFromContent({ props: { message: 'open' } }),
    })
    const viewStore = createDefineStore()

    const merged = mergeLayerStores(instanceStore, viewStore)

    expect(merged.content.props).toEqual({ message: 'open' })
  })

  it('should fold clone defaults into use tier', () => {
    const instanceStore = createTestInstanceStore({
      use: mergeFragment(
        toFragmentFromContent({ closeOn: ['done'] }),
        toFragmentFromContent({ closeOn: ['cancel'] }),
      ),
    })
    const viewStore = createDefineStore()

    expect(mergeLayerStores(instanceStore, viewStore).content.closeOn).toEqual({
      done: { when: 'always', confirmed: false },
      cancel: { when: 'always', confirmed: false },
    })
  })

  it('should fall back closeOn through use and define tiers', () => {
    const viewStore = createDefineStore()

    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromContent({ closeOn: ['done'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual({ done: { when: 'always', confirmed: false } })

    defineFragment(
      viewStore,
      toFragmentFromContainer({ content: { closeOn: ['submit'] } }),
    )
    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromContent({ closeOn: ['done'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual({
      submit: { when: 'always', confirmed: false },
      done: { when: 'always', confirmed: false },
    })

    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromContent({ closeOn: ['done'] }),
          open: toFragmentFromContent({ closeOn: ['cancel'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual({
      submit: { when: 'always', confirmed: false },
      done: { when: 'always', confirmed: false },
      cancel: { when: 'always', confirmed: false },
    })
  })

  it('should merge container model with priority open > use > define > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromContainer({ model: 'open' }),
      use: toFragmentFromContent({ container: { model: 'show' } }),
      open: toFragmentFromContent({ container: { model: 'modelValue' } }),
    })
    const viewStore = createDefineStore()
    defineFragment(viewStore, toFragmentFromContainer({ model: 'visible' }))

    expect(mergeLayerStores(instanceStore, viewStore).container.model).toBe('modelValue')
  })

  it('should keep content and container slots separate in merge', () => {
    const contentSlot = () => null
    const containerSlot = () => null
    const instanceStore = createTestInstanceStore({
      use: toFragmentFromContent({ slots: { header: contentSlot } }),
    })
    const viewStore = createDefineStore()
    defineFragment(viewStore, { container: { slots: { footer: containerSlot } } })

    const merged = mergeLayerStores(instanceStore, viewStore)

    // setup() wraps source slots; merge keeps sides apart and preserves wrapped refs.
    expect(merged.content.slots?.header).toBe(
      instanceStore.use.content?.slots?.header,
    )
    expect(merged.container.slots?.footer).toBe(
      viewStore.define.container?.slots?.footer,
    )
    expect(merged.content.slots?.header).not.toBe(contentSlot)
    expect(merged.container.slots?.footer).not.toBe(containerSlot)
  })

  it('should merge container slots with unified template tier priority', () => {
    const create = () => null
    const define = () => null
    const creator = () => null
    const useX = () => null
    const open = () => null

    const instanceStore = createTestInstanceStore({
      create: { container: { slots: { footer: create } } },
      use: toFragmentFromContent({ container: { slots: { footer: useX } } }),
      open: toFragmentFromContent({ container: { slots: { footer: open } } }),
    })
    instanceStore.template({
      name: 'footer',
      side: 'container',
      render: slotMarker('caller'),
    })

    const viewStore = createDefineStore()
    defineFragment(viewStore, { container: { slots: { footer: define } } })({
      name: 'footer',
      side: 'container',
      render: creator,
    })

    expect(mergeLayerStores(instanceStore, viewStore).container.slots?.footer).toBe(open)
  })

  it('should let use:template container win over define and define:template', () => {
    const define = () => null
    const creator = () => null

    const instanceStore = createTestInstanceStore({
      create: { container: { slots: { footer: () => null } } },
    })
    instanceStore.template({
      name: 'footer',
      side: 'container',
      render: slotMarker('caller'),
    })

    const viewStore = createDefineStore()
    defineFragment(viewStore, { container: { slots: { footer: define } } })({
      name: 'footer',
      side: 'container',
      render: creator,
    })

    const footer = mergeLayerStores(instanceStore, viewStore).container.slots?.footer
    expect(footer).toBeTypeOf('function')
    expect(footer).not.toBe(define)
    expect(footer).not.toBe(creator)
  })

  it('should let define container slot win over define:template', () => {
    const define = () => null
    const creator = () => null

    const instanceStore = createTestInstanceStore()
    const viewStore = createDefineStore()
    defineFragment(viewStore, { container: { slots: { footer: define } } })({
      name: 'footer',
      side: 'container',
      render: creator,
    })

    const merged = mergeLayerStores(instanceStore, viewStore).container.slots?.footer
    expect(merged).toBe(viewStore.define.container?.slots?.footer)
    expect(merged).not.toBe(viewStore['define:template'].container?.slots?.footer)
  })

  it('should let use:template content win over create defaults but lose to use', () => {
    const useX = () => null

    const instanceStore = createTestInstanceStore({
      create: { content: { slots: { extra: () => null } } },
      use: toFragmentFromContent({ slots: { extra: useX } }),
    })
    instanceStore.template({
      name: 'extra',
      side: 'content',
      render: slotMarker('caller'),
    })
    const viewStore = createDefineStore()

    const merged = mergeLayerStores(instanceStore, viewStore).content.slots?.extra
    expect(merged).toBe(instanceStore.use.content?.slots?.extra)
    expect(merged).not.toBe(instanceStore['use:template'].content?.slots?.extra)
  })
})
