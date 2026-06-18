import { describe, expect, it } from 'vitest'
import { mergeConfig } from '../merge-config'

describe('mergeConfig', () => {
  it('merges container props with priority show > partial > useX > defineLayer > defaults', () => {
    const merged = mergeConfig({
      layerDefaults: {
        container: { props: { title: 'Factory', width: '400px' } },
      },
      defineLayer: { props: { title: 'Defined' } },
      useOptions: { container: { props: { width: '640px' } } },
      showOptions: { container: { props: { title: 'Show' } } },
      partial: { container: { props: { width: '720px' } } },
    })

    expect(merged.container.props).toEqual({ title: 'Show', width: '720px' })
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

  it('keeps content and container slots separate in merge', () => {
    const contentSlot = () => null
    const containerSlot = () => null

    const merged = mergeConfig({
      layerDefaults: {},
      defineLayer: { container: { slots: { footer: containerSlot } } },
      useOptions: { slots: { header: contentSlot } },
      showOptions: {},
    })

    expect(merged.content.slots).toEqual({ header: contentSlot })
    expect(merged.container.slots).toEqual({ footer: containerSlot })
  })
})
