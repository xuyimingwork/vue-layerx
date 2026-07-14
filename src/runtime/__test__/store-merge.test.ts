import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import type {
  LayerConfigFragment,
  LayerTemplateEntry,
} from '@/types/config'
import type {
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'
import {
  createFragment,
  mergeFragment,
  toFragmentFromContent,
  toFragmentFromContainer,
} from '@/config/fragment'
import { createLayerInstanceStore } from '@/runtime/layer-instance'
import { createLayerStore } from '@/shared/layer-store'

function slotMarker(_label: string) {
  return () => null as never
}

function entry(label: string): LayerTemplateEntry {
  return { render: slotMarker(label) }
}

function createDefineStore(): LayerViewStoreWithTemplate {
  return createLayerStore({
    define: createFragment(),
    'define:template': createFragment(),
  })
}

function createTestInstanceStore(overrides: {
  create?: LayerConfigFragment
  use?: LayerConfigFragment
  open?: LayerConfigFragment
} = {}): LayerInstanceStoreWithTemplate {
  const store = createLayerInstanceStore({
    create: computed(() => overrides.create ?? {}),
    use: computed(() => overrides.use ?? {}),
  })
  if (overrides.open) store.open = overrides.open
  return store
}

function mergeLayerStores(
  instanceStore: LayerInstanceStoreWithTemplate,
  viewStore: LayerViewStoreWithTemplate,
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
    viewStore.define = toFragmentFromContainer({ props: { title: 'Defined' } })

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

    expect(mergeLayerStores(instanceStore, viewStore).content.closeOn).toEqual(['cancel'])
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
    ).toEqual(['done'])

    viewStore.define = toFragmentFromContainer({ content: { closeOn: ['submit'] } })
    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromContent({ closeOn: ['done'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual(['done'])

    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromContent({ closeOn: ['done'] }),
          open: toFragmentFromContent({ closeOn: ['cancel'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual(['cancel'])
  })

  it('should merge container model with priority open > use > define > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromContainer({ model: 'open' }),
      use: toFragmentFromContent({ container: { model: 'show' } }),
      open: toFragmentFromContent({ container: { model: 'modelValue' } }),
    })
    const viewStore = createDefineStore()
    viewStore.define = toFragmentFromContainer({ model: 'visible' })

    expect(mergeLayerStores(instanceStore, viewStore).container.model).toBe('modelValue')
  })

  it('should keep content and container slots separate in merge', () => {
    const contentSlot = () => null
    const containerSlot = () => null
    const instanceStore = createTestInstanceStore({
      use: toFragmentFromContent({ slots: { header: contentSlot } }),
    })
    const viewStore = createDefineStore()
    viewStore.define = { container: { slots: { footer: containerSlot } } }

    const merged = mergeLayerStores(instanceStore, viewStore)

    expect(merged.content.slots).toEqual({ header: contentSlot })
    expect(merged.container.slots).toEqual({ footer: containerSlot })
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
      key: 'use:template.container',
      name: 'footer',
      entry: entry('caller'),
    })

    const viewStore = createDefineStore()
    viewStore.define = { container: { slots: { footer: define } } }
    viewStore['define:template'] = { container: { slots: { footer: creator } } }

    expect(mergeLayerStores(instanceStore, viewStore).container.slots?.footer).toBe(open)
  })

  it('should let use:template container win over define and define:template', () => {
    const define = () => null
    const creator = () => null

    const instanceStore = createTestInstanceStore({
      create: { container: { slots: { footer: () => null } } },
    })
    instanceStore.template({
      key: 'use:template.container',
      name: 'footer',
      entry: entry('caller'),
    })

    const viewStore = createDefineStore()
    viewStore.define = { container: { slots: { footer: define } } }
    viewStore['define:template'] = { container: { slots: { footer: creator } } }

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
    viewStore.define = { container: { slots: { footer: define } } }
    viewStore['define:template'] = { container: { slots: { footer: creator } } }

    expect(mergeLayerStores(instanceStore, viewStore).container.slots?.footer).toBe(define)
  })

  it('should let use:template content win over create defaults but lose to use', () => {
    const useX = () => null

    const instanceStore = createTestInstanceStore({
      create: { content: { slots: { extra: () => null } } },
      use: toFragmentFromContent({ slots: { extra: useX } }),
    })
    instanceStore.template({
      key: 'use:template.content',
      name: 'extra',
      entry: entry('caller'),
    })
    const viewStore = createDefineStore()

    expect(mergeLayerStores(instanceStore, viewStore).content.slots?.extra).toBe(useX)
  })
})
