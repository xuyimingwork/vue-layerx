import { describe, expect, it } from 'vitest'
import type { LayerTemplateEntry } from '@/core/types/config'
import { mergeConfig } from '../merge-config'

function slotMarker(label: string) {
  return () => null as never
}

function entry(label: string): LayerTemplateEntry {
  return { render: slotMarker(label) }
}

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

  it('merges container slots with template tier priority', () => {
    const create = () => null
    const define = () => null
    const useX = () => null
    const show = () => null

    const merged = mergeConfig({
      layerDefaults: { container: { slots: { footer: create } } },
      defineLayer: { container: { slots: { footer: define } } },
      useOptions: { container: { slots: { footer: useX } } },
      showOptions: { container: { slots: { footer: show } } },
      templateTiers: {
        creatorContainer: { footer: entry('creator') },
        callerContainer: { footer: entry('caller') },
        callerContent: {},
      },
    })

    expect(merged.container.slots?.footer).toBe(show)
  })

  it('caller container template wins over define and creator templates', () => {
    const define = () => null

    const merged = mergeConfig({
      layerDefaults: { container: { slots: { footer: () => null } } },
      defineLayer: { container: { slots: { footer: define } } },
      useOptions: {},
      showOptions: {},
      templateTiers: {
        creatorContainer: { footer: entry('creator') },
        callerContainer: { footer: entry('caller') },
        callerContent: {},
      },
    })

    const footer = merged.container.slots?.footer
    expect(footer).toBeTypeOf('function')
    expect(footer).not.toBe(define)
  })

  it('define container slot wins over creator template', () => {
    const define = () => null

    const merged = mergeConfig({
      layerDefaults: {},
      defineLayer: { container: { slots: { footer: define } } },
      useOptions: {},
      showOptions: {},
      templateTiers: {
        creatorContainer: { footer: entry('creator') },
        callerContainer: {},
        callerContent: {},
      },
    })

    expect(merged.container.slots?.footer).toBe(define)
  })

  it('caller content template wins over create defaults but loses to useX', () => {
    const useX = () => null

    const merged = mergeConfig({
      layerDefaults: { content: { slots: { extra: () => null } } },
      defineLayer: null,
      useOptions: { slots: { extra: useX } },
      showOptions: {},
      templateTiers: {
        creatorContainer: {},
        callerContainer: {},
        callerContent: { extra: entry('caller') },
      },
    })

    expect(merged.content.slots?.extra).toBe(useX)
  })
})
