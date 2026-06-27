import { describe, expect, it, vi } from 'vitest'
import {
  createFragment,
  mergeFragment,
  stripFragment,
  toFragmentFromInstance,
  toFragmentFromStatic,
} from '../fragment'

describe('createFragment', () => {
  it('returns empty fragment by default', () => {
    expect(createFragment()).toEqual({})
  })

  it('returns init when provided', () => {
    const init = { container: { props: { title: 'x' } } }
    expect(createFragment(init)).toBe(init)
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

describe('stripFragment', () => {
  it('removes fields matching path predicate', () => {
    expect(
      stripFragment(
        {
          container: { props: { title: 'x', ref: vi.fn() } },
          content: { props: { message: 'hi', ref: vi.fn() }, closeOn: ['done'] },
        },
        (path) => path.endsWith('.props.ref'),
      ),
    ).toEqual({
      container: { props: { title: 'x' } },
      content: { props: { message: 'hi' }, closeOn: ['done'] },
    })
  })

  it('does not mutate input', () => {
    const input = { content: { props: { ref: vi.fn(), a: 1 } } }
    stripFragment(input, (path) => path.endsWith('.props.ref'))
    expect(input.content?.props?.ref).toBeTypeOf('function')
    expect(input.content?.props?.a).toBe(1)
  })
})
