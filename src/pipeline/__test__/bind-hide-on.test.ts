import { describe, expect, it, vi } from 'vitest'
import { bindHideOn } from '../bind-hide-on'

describe('bindHideOn', () => {
  it('returns original props when events is empty or undefined', () => {
    const props = { message: 'hi' }
    expect(bindHideOn(props, undefined, vi.fn())).toBe(props)
    expect(bindHideOn(props, [], vi.fn())).toBe(props)
  })

  it('wraps event listeners and calls hide after existing handler', () => {
    const hide = vi.fn()
    const prev = vi.fn()
    const props = { onDone: prev, message: 'x' }

    const bound = bindHideOn(props, ['done'], hide)
    ;(bound.onDone as (...args: unknown[]) => void)('payload')

    expect(prev).toHaveBeenCalledWith('payload')
    expect(hide).toHaveBeenCalledOnce()
  })

  it('capitalizes multi-char event names correctly', () => {
    const hide = vi.fn()
    const bound = bindHideOn({}, ['beforeClose'], hide)
    expect(bound.onBeforeClose).toBeTypeOf('function')
  })
})
