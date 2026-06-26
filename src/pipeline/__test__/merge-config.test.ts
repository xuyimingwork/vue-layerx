import { describe, expect, it } from 'vitest'
import type { LayerConfigFragment, LayerTemplateEntry } from '@/types/config'
import { toFragmentFromInstance, toFragmentFromStatic } from '../to-fragment'
import { mergeFragment, mergeLayerConfigStore } from '../merge-config'
import { createLayerConfigStore, type LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'

function slotMarker(_label: string) {
  return () => null as never
}

function entry(label: string): LayerTemplateEntry {
  return { render: slotMarker(label) }
}

function createTestStore(overrides: {
  create?: LayerConfigFragment
  use?: LayerConfigFragment
  clone?: LayerConfigFragment
  open?: LayerConfigFragment
} = {}): LayerConfigStoreWithRegistry {
  return createLayerConfigStore({
    create: overrides.create ?? {},
    use: overrides.use,
    clone: overrides.clone,
    open: overrides.open,
  })
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

describe('mergeLayerConfigStore', () => {
  it('merges container props with priority open > clone > use > define > create', () => {
    const merged = mergeLayerConfigStore(
      createTestStore({
        create: toFragmentFromStatic({ props: { title: 'Create', width: '400px' } }),
        use: toFragmentFromInstance({ container: { props: { width: '640px' } } }),
        open: toFragmentFromInstance({ container: { props: { title: 'Open' } } }),
        clone: toFragmentFromInstance({ container: { props: { width: '720px' } } }),
      }),
      toFragmentFromStatic({ props: { title: 'Defined' } }),
    )

    expect(merged.container.props).toEqual({ title: 'Open', width: '720px' })
  })

  it('merges content props with priority open > clone > use > create', () => {
    const merged = mergeLayerConfigStore(
      createTestStore({
        create: toFragmentFromStatic({ content: { props: { message: 'create' } } }),
        use: toFragmentFromInstance({ props: { message: 'use' } }),
        open: toFragmentFromInstance({ props: { message: 'open' } }),
        clone: toFragmentFromInstance({ props: { message: 'clone' } }),
      }),
    )

    expect(merged.content.props).toEqual({ message: 'open' })
  })

  it('falls back closeOn through clone, use, and define', () => {
    expect(
      mergeLayerConfigStore(
        createTestStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
        }),
      ).content.closeOn,
    ).toEqual(['done'])

    expect(
      mergeLayerConfigStore(
        createTestStore(),
        toFragmentFromStatic({ content: { closeOn: ['submit'] } }),
      ).content.closeOn,
    ).toEqual(['submit'])

    expect(
      mergeLayerConfigStore(
        createTestStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
        }),
        toFragmentFromStatic({ content: { closeOn: ['submit'] } }),
      ).content.closeOn,
    ).toEqual(['done'])

    expect(
      mergeLayerConfigStore(
        createTestStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
          open: toFragmentFromInstance({ closeOn: ['cancel'] }),
        }),
      ).content.closeOn,
    ).toEqual(['cancel'])

    expect(
      mergeLayerConfigStore(
        createTestStore({
          use: toFragmentFromInstance({ closeOn: ['done'] }),
          clone: toFragmentFromInstance({ closeOn: ['cancel'] }),
        }),
      ).content.closeOn,
    ).toEqual(['cancel'])
  })

  it('merges container model with priority open > clone > use > define > create', () => {
    const merged = mergeLayerConfigStore(
      createTestStore({
        create: toFragmentFromStatic({ model: 'open' }),
        use: toFragmentFromInstance({ container: { model: 'show' } }),
        clone: toFragmentFromInstance({ container: { model: 'active' } }),
        open: toFragmentFromInstance({ container: { model: 'modelValue' } }),
      }),
      toFragmentFromStatic({ model: 'visible' }),
    )

    expect(merged.container.model).toBe('modelValue')
  })

  it('keeps content and container slots separate in merge', () => {
    const contentSlot = () => null
    const containerSlot = () => null

    const merged = mergeLayerConfigStore(
      createTestStore({
        use: toFragmentFromInstance({ slots: { header: contentSlot } }),
      }),
      { container: { slots: { footer: containerSlot } } },
    )

    expect(merged.content.slots).toEqual({ header: contentSlot })
    expect(merged.container.slots).toEqual({ footer: containerSlot })
  })

  it('merges container slots with template tier priority', () => {
    const create = () => null
    const define = () => null
    const useX = () => null
    const open = () => null

    const store = createTestStore({
      create: { container: { slots: { footer: create } } },
      use: toFragmentFromInstance({ container: { slots: { footer: useX } } }),
      open: toFragmentFromInstance({ container: { slots: { footer: open } } }),
    })
    store.registerCreatorContainerTemplate('footer', entry('creator'))
    store.registerCallerContainerTemplate('footer', entry('caller'))

    const merged = mergeLayerConfigStore(store, { container: { slots: { footer: define } } })

    expect(merged.container.slots?.footer).toBe(open)
  })

  it('caller container template wins over define and creator templates', () => {
    const define = () => null

    const store = createTestStore({
      create: { container: { slots: { footer: () => null } } },
    })
    store.registerCreatorContainerTemplate('footer', entry('creator'))
    store.registerCallerContainerTemplate('footer', entry('caller'))

    const merged = mergeLayerConfigStore(store, { container: { slots: { footer: define } } })

    const footer = merged.container.slots?.footer
    expect(footer).toBeTypeOf('function')
    expect(footer).not.toBe(define)
  })

  it('define container slot wins over creator template', () => {
    const define = () => null

    const store = createTestStore()
    store.registerCreatorContainerTemplate('footer', entry('creator'))

    const merged = mergeLayerConfigStore(store, { container: { slots: { footer: define } } })

    expect(merged.container.slots?.footer).toBe(define)
  })

  it('caller content template wins over create defaults but loses to use', () => {
    const useX = () => null

    const store = createTestStore({
      create: { content: { slots: { extra: () => null } } },
      use: toFragmentFromInstance({ slots: { extra: useX } }),
    })
    store.registerCallerContentTemplate('extra', entry('caller'))

    const merged = mergeLayerConfigStore(store)

    expect(merged.content.slots?.extra).toBe(useX)
  })
})
