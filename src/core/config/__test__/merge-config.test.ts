import { describe, expect, it } from 'vitest'
import { mergeConfig } from '../merge-config'

describe('mergeConfig', () => {
  it('merges layer props with priority show > partial > useX > defineLayer > defaults', () => {
    const merged = mergeConfig({
      layerDefaults: {
        layer: { props: { title: 'Factory', width: '400px' } },
      },
      defineLayer: { props: { title: 'Defined' } },
      useOptions: { layer: { props: { width: '640px' } } },
      showOptions: { layer: { props: { title: 'Show' } } },
      partial: { layer: { props: { width: '720px' } } },
    })

    expect(merged.layer.props).toEqual({ title: 'Show', width: '720px' })
  })

  it('merges content props with priority show > partial > useX > defaults', () => {
    const merged = mergeConfig({
      layerDefaults: {
        content: { props: { message: 'factory' } },
      },
      defineLayer: null,
      useOptions: { props: { message: 'use' } },
      showOptions: { props: { message: 'show' } },
      partial: { props: { message: 'partial' } },
    })

    expect(merged.content.props).toEqual({ message: 'show' })
  })

  it('falls back hideOn through partial, useX, and defineLayer', () => {
    expect(
      mergeConfig({
        layerDefaults: {},
        defineLayer: null,
        useOptions: { hideOn: ['done'] },
        showOptions: {},
      }).hideOn,
    ).toEqual(['done'])

    expect(
      mergeConfig({
        layerDefaults: {},
        defineLayer: { hideOn: ['submit'] },
        useOptions: {},
        showOptions: {},
      }).hideOn,
    ).toEqual(['submit'])

    expect(
      mergeConfig({
        layerDefaults: {},
        defineLayer: { hideOn: ['submit'] },
        useOptions: { hideOn: ['done'] },
        showOptions: {},
      }).hideOn,
    ).toEqual(['done'])

    expect(
      mergeConfig({
        layerDefaults: {},
        defineLayer: null,
        useOptions: { hideOn: ['done'] },
        showOptions: { hideOn: ['cancel'] },
      }).hideOn,
    ).toEqual(['cancel'])

    expect(
      mergeConfig({
        layerDefaults: {},
        defineLayer: null,
        useOptions: { hideOn: ['done'] },
        showOptions: {},
        partial: { hideOn: ['cancel'] },
      }).hideOn,
    ).toEqual(['cancel'])
  })

  it('keeps content and layer slots separate in merge', () => {
    const contentSlot = () => null
    const layerSlot = () => null

    const merged = mergeConfig({
      layerDefaults: {},
      defineLayer: { layer: { slots: { footer: layerSlot } } },
      useOptions: { slots: { header: contentSlot } },
      showOptions: {},
    })

    expect(merged.content.slots).toEqual({ header: contentSlot })
    expect(merged.layer.slots).toEqual({ footer: layerSlot })
  })
})
