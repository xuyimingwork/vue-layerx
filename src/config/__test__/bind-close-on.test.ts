import { describe, expect, it, vi } from 'vitest'
import { bindCloseOn } from '../bind-close-on'

describe('bindCloseOn', () => {
  it('returns props unchanged when closeOn is empty or undefined', () => {
    const props = { message: 'x' }
    expect(bindCloseOn(props, undefined, vi.fn())).toBe(props)
    expect(bindCloseOn(props, [], vi.fn())).toBe(props)
  })

  it('binds close handler to content emit listeners', () => {
    const hide = vi.fn()
    const props = { onDone: vi.fn() }

    const bound = bindCloseOn(props, ['done'], hide)

    bound.onDone?.()
    expect(props.onDone).toHaveBeenCalled()
    expect(hide).toHaveBeenCalled()
  })

  it('creates listener when no prior handler exists', () => {
    const hide = vi.fn()
    const bound = bindCloseOn({}, ['beforeClose'], hide)

    bound.onBeforeClose?.()
    expect(hide).toHaveBeenCalled()
  })
})
