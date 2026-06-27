import { describe, expect, it } from 'vitest'
import type { LayerConfigFragment, LayerTemplateEntry } from '@/types/config'
import { mergeFragment } from '@/pipeline/merge-node-config'
import { toFragmentFromInstance, toFragmentFromStatic } from '../to-fragment'
import {
  createLayerInstanceStore,
  createLayerViewStore,
  type LayerInstanceStoreWithTemplate,
  type LayerViewStoreWithTemplate,
} from '@/instance/layer-store'

function slotMarker(_label: string) {
  return () => null as never
}

function entry(label: string): LayerTemplateEntry {
  return { render: slotMarker(label) }
}

function createTestInstanceStore(overrides: {
  create?: LayerConfigFragment
  use?: LayerConfigFragment
  open?: LayerConfigFragment
} = {}): LayerInstanceStoreWithTemplate {
  const store = createLayerInstanceStore({
    create: overrides.create ?? {},
    use: overrides.use,
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

describe('mergeFragment', () => {
  it('merges container and content sides with later wins', () => {
    const A = {} as never
    const B = {} as never
    expect(
      mergeFragment(
        { container: { model: 'a', props: { width: '400px' } } },
        { container: { model: 'b', props: { title: 'hi' } } },
        { container: { component: A } },
      ),
    ).toEqual({
      container: { model: 'b', props: { title: 'hi', width: '400px' }, component: A },
    })
  })

  it('returns empty fragment when all sources are empty', () => {
    expect(mergeFragment({}, undefined, null)).toEqual({})
  })
})

describe('layer store merge', () => {
  it('merges container props with priority open > use > define > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromStatic({ props: { title: 'Create', width: '400px' } }),
      use: toFragmentFromInstance({ container: { props: { width: '640px' } } }),
      open: toFragmentFromInstance({ container: { props: { title: 'Open' } } }),
    })
    const viewStore = createLayerViewStore()
    viewStore.define = toFragmentFromStatic({ props: { title: 'Defined' } })

    const merged = mergeLayerStores(instanceStore, viewStore)

    expect(merged.container.props).toEqual({ title: 'Open', width: '640px' })
  })

  it('merges content props with priority open > use > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromStatic({ content: { props: { message: 'create' } } }),
      use: toFragmentFromInstance({ props: { message: 'use' } }),
      open: toFragmentFromInstance({ props: { message: 'open' } }),
    })
    const viewStore = createLayerViewStore()

    const merged = mergeLayerStores(instanceStore, viewStore)

    expect(merged.content.props).toEqual({ message: 'open' })
  })

  it('folds clone defaults into use tier', () => {
    const instanceStore = createTestInstanceStore({
      use: mergeFragment(
        toFragmentFromInstance({ closeOn: ['done'] }),
        toFragmentFromInstance({ closeOn: ['cancel'] }),
      ),
    })
    const viewStore = createLayerViewStore()

    expect(mergeLayerStores(instanceStore, viewStore).content.closeOn).toEqual(['cancel'])
  })

  it('falls back closeOn through use and define', () => {
    const viewStore = createLayerViewStore()

    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual(['done'])

    viewStore.define = toFragmentFromStatic({ content: { closeOn: ['submit'] } })
    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual(['done'])

    expect(
      mergeLayerStores(
        createTestInstanceStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
          open: toFragmentFromInstance({ closeOn: ['cancel'] }),
        }),
        viewStore,
      ).content.closeOn,
    ).toEqual(['cancel'])
  })

  it('merges container model with priority open > use > define > create', () => {
    const instanceStore = createTestInstanceStore({
      create: toFragmentFromStatic({ model: 'open' }),
      use: toFragmentFromInstance({ container: { model: 'show' } }),
      open: toFragmentFromInstance({ container: { model: 'modelValue' } }),
    })
    const viewStore = createLayerViewStore()
    viewStore.define = toFragmentFromStatic({ model: 'visible' })

    expect(mergeLayerStores(instanceStore, viewStore).container.model).toBe('modelValue')
  })

  it('keeps content and container slots separate in merge', () => {
    const contentSlot = () => null
    const containerSlot = () => null
    const instanceStore = createTestInstanceStore({
      use: toFragmentFromInstance({ slots: { header: contentSlot } }),
    })
    const viewStore = createLayerViewStore()
    viewStore.define = { container: { slots: { footer: containerSlot } } }

    const merged = mergeLayerStores(instanceStore, viewStore)

    expect(merged.content.slots).toEqual({ header: contentSlot })
    expect(merged.container.slots).toEqual({ footer: containerSlot })
  })

  it('merges container slots with unified template tier priority', () => {
    const create = () => null
    const define = () => null
    const creator = () => null
    const useX = () => null
    const open = () => null

    const instanceStore = createTestInstanceStore({
      create: { container: { slots: { footer: create } } },
      use: toFragmentFromInstance({ container: { slots: { footer: useX } } }),
      open: toFragmentFromInstance({ container: { slots: { footer: open } } }),
    })
    instanceStore.template({
      key: 'use:template.container',
      name: 'footer',
      entry: entry('caller'),
    })

    const viewStore = createLayerViewStore()
    viewStore.define = { container: { slots: { footer: define } } }
    viewStore['define:template'] = { container: { slots: { footer: creator } } }

    expect(mergeLayerStores(instanceStore, viewStore).container.slots?.footer).toBe(open)
  })

  it('use:template container wins over define and define:template', () => {
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

    const viewStore = createLayerViewStore()
    viewStore.define = { container: { slots: { footer: define } } }
    viewStore['define:template'] = { container: { slots: { footer: creator } } }

    const footer = mergeLayerStores(instanceStore, viewStore).container.slots?.footer
    expect(footer).toBeTypeOf('function')
    expect(footer).not.toBe(define)
    expect(footer).not.toBe(creator)
  })

  it('define container slot wins over define:template', () => {
    const define = () => null
    const creator = () => null

    const instanceStore = createTestInstanceStore()
    const viewStore = createLayerViewStore()
    viewStore.define = { container: { slots: { footer: define } } }
    viewStore['define:template'] = { container: { slots: { footer: creator } } }

    expect(mergeLayerStores(instanceStore, viewStore).container.slots?.footer).toBe(define)
  })

  it('use:template content wins over create defaults but loses to use', () => {
    const useX = () => null

    const instanceStore = createTestInstanceStore({
      create: { content: { slots: { extra: () => null } } },
      use: toFragmentFromInstance({ slots: { extra: useX } }),
    })
    instanceStore.template({
      key: 'use:template.content',
      name: 'extra',
      entry: entry('caller'),
    })
    const viewStore = createLayerViewStore()

    expect(mergeLayerStores(instanceStore, viewStore).content.slots?.extra).toBe(useX)
  })
})
