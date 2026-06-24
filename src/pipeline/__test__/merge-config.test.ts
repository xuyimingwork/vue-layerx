import { describe, expect, it } from 'vitest'
import type { LayerConfigFragment, LayerTemplateEntry } from '@/types/config'
import { toFragmentFromInstance, toFragmentFromStatic } from '../to-fragment'
import { mergeLayerState } from '../merge-config'
import { createLayerState, type LayerStateWithRegistry } from '@/instance/layer-state'

function slotMarker(_label: string) {
  return () => null as never
}

function entry(label: string): LayerTemplateEntry {
  return { render: slotMarker(label) }
}

function createTestState(overrides: {
  create?: LayerConfigFragment
  define?: LayerConfigFragment | null
  use?: LayerConfigFragment
  clone?: LayerConfigFragment
  show?: LayerConfigFragment
} = {}): LayerStateWithRegistry {
  const state = createLayerState({
    create: overrides.create ?? {},
    use: overrides.use,
    clone: overrides.clone,
    show: overrides.show,
  })
  if (overrides.define !== undefined) state.define = overrides.define
  return state
}

describe('mergeLayerState', () => {
  it('merges container props with priority show > clone > use > define > create', () => {
    const merged = mergeLayerState(
      createTestState({
        create: toFragmentFromStatic({ props: { title: 'Create', width: '400px' } }),
        define: toFragmentFromStatic({ props: { title: 'Defined' } }),
        use: toFragmentFromInstance({ container: { props: { width: '640px' } } }),
        show: toFragmentFromInstance({ container: { props: { title: 'Show' } } }),
        clone: toFragmentFromInstance({ container: { props: { width: '720px' } } }),
      }),
    )

    expect(merged.container.props).toEqual({ title: 'Show', width: '720px' })
  })

  it('merges content props with priority show > clone > use > create', () => {
    const merged = mergeLayerState(
      createTestState({
        create: toFragmentFromStatic({ content: { props: { message: 'create' } } }),
        use: toFragmentFromInstance({ props: { message: 'use' } }),
        show: toFragmentFromInstance({ props: { message: 'show' } }),
        clone: toFragmentFromInstance({ props: { message: 'clone' } }),
      }),
    )

    expect(merged.content.props).toEqual({ message: 'show' })
  })

  it('falls back hideOn through clone, use, and define', () => {
    expect(
      mergeLayerState(
        createTestState({
          use: toFragmentFromInstance({ hideOn: ['done'] }),
        }),
      ).hideOn,
    ).toEqual(['done'])

    expect(
      mergeLayerState(
        createTestState({
          define: toFragmentFromStatic({ hideOn: ['submit'] }),
        }),
      ).hideOn,
    ).toEqual(['submit'])

    expect(
      mergeLayerState(
        createTestState({
          define: toFragmentFromStatic({ hideOn: ['submit'] }),
          use: toFragmentFromInstance({ hideOn: ['done'] }),
        }),
      ).hideOn,
    ).toEqual(['done'])

    expect(
      mergeLayerState(
        createTestState({
          use: toFragmentFromInstance({ hideOn: ['done'] }),
          show: toFragmentFromInstance({ hideOn: ['cancel'] }),
        }),
      ).hideOn,
    ).toEqual(['cancel'])

    expect(
      mergeLayerState(
        createTestState({
          use: toFragmentFromInstance({ hideOn: ['done'] }),
          clone: toFragmentFromInstance({ hideOn: ['cancel'] }),
        }),
      ).hideOn,
    ).toEqual(['cancel'])
  })

  it('keeps content and container slots separate in merge', () => {
    const contentSlot = () => null
    const containerSlot = () => null

    const merged = mergeLayerState(
      createTestState({
        define: { container: { slots: { footer: containerSlot } } },
        use: toFragmentFromInstance({ slots: { header: contentSlot } }),
      }),
    )

    expect(merged.content.slots).toEqual({ header: contentSlot })
    expect(merged.container.slots).toEqual({ footer: containerSlot })
  })

  it('merges container slots with template tier priority', () => {
    const create = () => null
    const define = () => null
    const useX = () => null
    const show = () => null

    const state = createTestState({
      create: { container: { slots: { footer: create } } },
      define: { container: { slots: { footer: define } } },
      use: toFragmentFromInstance({ container: { slots: { footer: useX } } }),
      show: toFragmentFromInstance({ container: { slots: { footer: show } } }),
    })
    state.registerCreatorContainerTemplate('footer', entry('creator'))
    state.registerCallerContainerTemplate('footer', entry('caller'))

    const merged = mergeLayerState(state)

    expect(merged.container.slots?.footer).toBe(show)
  })

  it('caller container template wins over define and creator templates', () => {
    const define = () => null

    const state = createTestState({
      create: { container: { slots: { footer: () => null } } },
      define: { container: { slots: { footer: define } } },
    })
    state.registerCreatorContainerTemplate('footer', entry('creator'))
    state.registerCallerContainerTemplate('footer', entry('caller'))

    const merged = mergeLayerState(state)

    const footer = merged.container.slots?.footer
    expect(footer).toBeTypeOf('function')
    expect(footer).not.toBe(define)
  })

  it('define container slot wins over creator template', () => {
    const define = () => null

    const state = createTestState({
      define: { container: { slots: { footer: define } } },
    })
    state.registerCreatorContainerTemplate('footer', entry('creator'))

    const merged = mergeLayerState(state)

    expect(merged.container.slots?.footer).toBe(define)
  })

  it('caller content template wins over create defaults but loses to use', () => {
    const useX = () => null

    const state = createTestState({
      create: { content: { slots: { extra: () => null } } },
      use: toFragmentFromInstance({ slots: { extra: useX } }),
    })
    state.registerCallerContentTemplate('extra', entry('caller'))

    const merged = mergeLayerState(state)

    expect(merged.content.slots?.extra).toBe(useX)
  })
})
