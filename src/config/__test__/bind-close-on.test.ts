import { describe, expect, it, vi } from 'vitest'
import { bindCloseOn } from '../bind-close-on'
import { mergeCloseOn, normalizeCloseOn } from '../close-on'
import type { CloseOn } from '@/types/config'

const always = (confirmed = false) =>
  ({ when: 'always' as const, confirmed })

describe('normalizeCloseOn', () => {
  it('should expand array strings to always entries', () => {
    expect(normalizeCloseOn(['done', 'cancel'])).toEqual({
      done: always(),
      cancel: always(),
    })
  })

  it('should expand record true / false / when sugars', () => {
    const when = (ok: unknown) => ok === true
    expect(
      normalizeCloseOn({
        submit: true,
        cancel: false,
        apply: 'always',
        drop: 'none',
        check: when,
      }),
    ).toEqual({
      submit: always(),
      cancel: { when: 'none', confirmed: false },
      apply: always(),
      drop: { when: 'none', confirmed: false },
      check: { when, confirmed: false },
    })
  })

  it('should require when on object entries', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(normalizeCloseOn({ submit: { confirmed: true } as never })).toBeUndefined()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('should force confirmed false on when none', () => {
    expect(
      normalizeCloseOn({ submit: { when: 'none', confirmed: true } }),
    ).toEqual({ submit: { when: 'none', confirmed: false } })
  })

  it('should let later array entries win for the same event', () => {
    const when = () => true
    expect(
      normalizeCloseOn(['submit', { event: 'submit', when }]),
    ).toEqual({ submit: { when, confirmed: false } })
  })
})

describe('mergeCloseOn', () => {
  it('should patch per event and replace whole entries', () => {
    const lower: CloseOn = {
      submit: { when: () => true, confirmed: true },
      cancel: always(),
    }
    const upper: CloseOn = {
      submit: { when: () => false, confirmed: false },
    }
    expect(mergeCloseOn(lower, upper)).toEqual({
      submit: { when: upper.submit.when, confirmed: false },
      cancel: always(),
    })
  })

  it('should delete event when when is none', () => {
    const lower: CloseOn = {
      submit: always(),
      cancel: always(),
    }
    expect(
      mergeCloseOn(lower, { submit: { when: 'none', confirmed: false } }),
    ).toEqual({ cancel: always() })
  })

  it('should return undefined when no sources provide closeOn', () => {
    expect(mergeCloseOn(undefined, undefined)).toBeUndefined()
  })
})

describe('bindCloseOn', () => {
  it('should return props unchanged when closeOn is empty or undefined', () => {
    const props = { message: 'x' }
    expect(bindCloseOn(props, undefined, vi.fn())).toBe(props)
    expect(bindCloseOn(props, {}, vi.fn())).toBe(props)
  })

  it('should bind close handler to content emit listeners', () => {
    const hide = vi.fn()
    const props = { onDone: vi.fn() }

    const bound = bindCloseOn(props, { done: always() }, hide)

    ;(bound.onDone as ((...args: unknown[]) => void) | undefined)?.('payload')
    expect(props.onDone).toHaveBeenCalledWith('payload')
    expect(hide).toHaveBeenCalledWith({
      confirmed: false,
      source: 'content',
      event: 'done',
      args: ['payload'],
    })
  })

  it('should pass confirmed true from closeOn entry', () => {
    const hide = vi.fn()
    const bound = bindCloseOn({}, { done: always(true) }, hide)

    ;(bound.onDone as (() => void) | undefined)?.()
    expect(hide).toHaveBeenCalledWith({
      confirmed: true,
      source: 'content',
      event: 'done',
      args: [],
    })
  })

  it('should create listener when no prior handler exists', () => {
    const hide = vi.fn()
    const bound = bindCloseOn({}, { beforeClose: always() }, hide)

    ;(bound.onBeforeClose as (() => void) | undefined)?.()
    expect(hide).toHaveBeenCalled()
  })

  it('should close only when when returns true', () => {
    const hide = vi.fn()
    const bound = bindCloseOn(
      {},
      { submit: { when: (ok) => ok === true, confirmed: false } },
      hide,
    )
    const onSubmit = bound.onSubmit as ((ok: boolean) => void) | undefined
    onSubmit?.(false)
    expect(hide).not.toHaveBeenCalled()
    onSubmit?.(true)
    expect(hide).toHaveBeenCalledOnce()
  })

  it('should skip when none entries', () => {
    const hide = vi.fn()
    const bound = bindCloseOn(
      {},
      { submit: { when: 'none', confirmed: false } },
      hide,
    )
    expect(bound.onSubmit).toBeUndefined()
  })
})
