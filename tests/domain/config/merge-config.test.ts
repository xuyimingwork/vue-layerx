import { describe, expect, it } from 'vitest'
import { mergeConfig } from '../../../src/domain/config/merge-config'

describe('mergeConfig', () => {
  it('merges by priority: show > useDialog > layer() > createLayerx', () => {
    const result = mergeConfig({
      factoryOptions: {
        props: { title: 'Default', width: '400px', destroyOnClose: false },
        content: { props: { message: 'factory' } },
      },
      layerDefinition: {
        props: { title: 'FromLayer', destroyOnClose: true },
        content: { props: { message: 'layer-def' } },
      },
      useOptions: {
        props: { mode: 'create' },
        layer: { props: { width: '640px' } },
      },
      showOptions: {
        props: { id: 1 },
        layer: { props: { title: 'FromShow' } },
        hideOn: ['done'],
      },
    })

    expect(result.layerProps).toEqual({
      title: 'FromShow',
      width: '640px',
      destroyOnClose: true,
    })
    expect(result.contentProps).toEqual({
      message: 'layer-def',
      mode: 'create',
      id: 1,
    })
    expect(result.hideOn).toEqual(['done'])
  })

  it('falls back to useDialog hideOn when show has none', () => {
    const result = mergeConfig({
      factoryOptions: {},
      layerDefinition: null,
      useOptions: { hideOn: ['cancel'] },
      showOptions: {},
    })
    expect(result.hideOn).toEqual(['cancel'])
  })

  it('separates content slots from layer slots', () => {
    const contentSlot = { value: { render: () => null } }
    const layerSlot = { value: { render: () => null } }

    const result = mergeConfig({
      factoryOptions: { slots: { footer: layerSlot } },
      layerDefinition: null,
      useOptions: { slots: { extra: contentSlot } },
      showOptions: {},
    })

    expect(result.contentSlots.extra).toBe(contentSlot)
    expect(result.layerSlots.footer).toBe(layerSlot)
    expect(result.contentSlots.footer).toBeUndefined()
  })
})
