import { describe, expect, it } from 'vitest'
import { pickNodeConfig, toFragmentFromInstance, toFragmentFromStatic } from '../to-fragment'

describe('pickNodeConfig', () => {
  it('extracts component, props, and slots', () => {
    const fn = () => null
    expect(
      pickNodeConfig({
        component: {} as never,
        props: { message: 'hi' },
        slots: { footer: fn },
      }),
    ).toEqual({
      component: {},
      props: { message: 'hi' },
      slots: { footer: fn },
    })
  })
})

describe('toFragmentFromStatic', () => {
  it('maps top-level fields to container fragment', () => {
    expect(
      toFragmentFromStatic({
        props: { title: 'x', width: '400px' },
        content: { props: { tone: 'info' } },
        hideOn: ['done'],
      }),
    ).toEqual({
      container: { props: { title: 'x', width: '400px' } },
      content: { props: { tone: 'info' } },
      hideOn: ['done'],
    })
  })
})

describe('toFragmentFromInstance', () => {
  it('maps top-level fields to content fragment', () => {
    expect(
      toFragmentFromInstance({
        props: { message: 'hi' },
        container: { props: { title: 'x' } },
        hideOn: ['done'],
      }),
    ).toEqual({
      content: { props: { message: 'hi' } },
      container: { props: { title: 'x' } },
      hideOn: ['done'],
    })
  })

  it('returns empty fragment for empty config', () => {
    expect(toFragmentFromInstance({})).toEqual({})
  })
})
