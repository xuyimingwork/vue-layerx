import { describe, expect, it } from 'vitest'
import { pickContainerNode, pickContentNode, toFragmentFromInstance, toFragmentFromStatic } from '../to-fragment'

describe('pickContainerNode', () => {
  it('extracts component, props, slots, and model', () => {
    const fn = () => null
    expect(
      pickContainerNode({
        component: {} as never,
        props: { title: 'hi' },
        slots: { footer: fn },
        model: 'open',
      }),
    ).toEqual({
      component: {},
      props: { title: 'hi' },
      slots: { footer: fn },
      model: 'open',
    })
  })
})

describe('pickContentNode', () => {
  it('extracts component, props, slots, and closeOn', () => {
    const fn = () => null
    expect(
      pickContentNode({
        component: {} as never,
        props: { message: 'hi' },
        slots: { extra: fn },
        closeOn: ['done'],
      }),
    ).toEqual({
      component: {},
      props: { message: 'hi' },
      slots: { extra: fn },
      closeOn: ['done'],
    })
  })
})

describe('toFragmentFromStatic', () => {
  it('maps top-level fields to container fragment and nested content', () => {
    expect(
      toFragmentFromStatic({
        props: { title: 'x', width: '400px' },
        content: { props: { tone: 'info' }, closeOn: ['done'] },
        model: 'open',
      }),
    ).toEqual({
      container: { props: { title: 'x', width: '400px' }, model: 'open' },
      content: { props: { tone: 'info' }, closeOn: ['done'] },
    })
  })
})

describe('toFragmentFromInstance', () => {
  it('maps top-level fields to content fragment', () => {
    expect(
      toFragmentFromInstance({
        props: { message: 'hi' },
        container: { props: { title: 'x' } },
        closeOn: ['done'],
      }),
    ).toEqual({
      content: { props: { message: 'hi' }, closeOn: ['done'] },
      container: { props: { title: 'x' } },
    })
  })

  it('returns empty fragment for empty config', () => {
    expect(toFragmentFromInstance({})).toEqual({})
  })
})
