import { describe, expect, it, vi } from 'vitest'
import { isRef, ref } from 'vue'
import {
  mergeFragment,
  stripFragment,
  toFragmentFromContent,
  toFragmentFromContainer,
} from '../fragment'

describe('toFragmentFromContainer', () => {
  it('should map top-level fields to container fragment and nested content', () => {
    expect(
      toFragmentFromContainer({
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

describe('toFragmentFromContent', () => {
  it('should map top-level fields to content fragment', () => {
    expect(
      toFragmentFromContent({
        props: { message: 'hi' },
        container: { props: { title: 'x' } },
        closeOn: ['done'],
      }),
    ).toEqual({
      content: { props: { message: 'hi' }, closeOn: ['done'] },
      container: { props: { title: 'x' } },
    })
  })

  it('should return empty fragment when config is empty', () => {
    expect(toFragmentFromContent({})).toEqual({})
  })

  it('should not mutate input when normalizing props.ref', () => {
    const userRef = ref(null)
    const contentConfig = {
      props: { message: 'hi', ref: userRef },
      container: { props: { title: 'x', ref: userRef } },
      closeOn: ['done'] as string[],
    }
    const fragment = toFragmentFromContent(contentConfig)

    expect(contentConfig.props.ref).toBe(userRef)
    expect(isRef(contentConfig.props.ref)).toBe(true)
    expect(contentConfig.container.props.ref).toBe(userRef)
    expect(typeof fragment.content?.props?.ref).toBe('function')
    expect(typeof fragment.container?.props?.ref).toBe('function')
    expect(fragment.content?.props?.ref).not.toBe(userRef)
  })
})

describe('mergeFragment', () => {
  it('should merge container and content sides with later sources winning', () => {
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

  it('should return empty fragment when all sources are empty', () => {
    expect(mergeFragment({}, undefined, null)).toEqual({})
  })

  it('should ignore adapter on create-shaped sources', () => {
    const adapter = (f: { content?: unknown }) => f
    const merged = mergeFragment(
      {
        container: { props: { title: 'a' } },
        adapter,
      } as Parameters<typeof mergeFragment>[0] & { adapter: typeof adapter },
      { container: { props: { title: 'b' } } },
    )
    expect(merged).toEqual({ container: { props: { title: 'b' } } })
    expect('adapter' in merged).toBe(false)
  })
})

describe('stripFragment', () => {
  it('should remove fields matching path predicate', () => {
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

  it('should not mutate input', () => {
    const input = { content: { props: { ref: vi.fn(), a: 1 } } }
    stripFragment(input, (path) => path.endsWith('.props.ref'))
    expect(input.content?.props?.ref).toBeTypeOf('function')
    expect(input.content?.props?.a).toBe(1)
  })

  it('should preserve model and closeOn when node has no props', () => {
    expect(
      stripFragment(
        {
          container: { model: 'open' },
          content: { closeOn: ['done'] },
        },
        (path) => path.endsWith('.props.ref'),
      ),
    ).toEqual({
      container: { model: 'open' },
      content: { closeOn: ['done'] },
    })
  })
})
