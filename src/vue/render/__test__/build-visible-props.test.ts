import { describe, expect, it, vi } from 'vitest'
import { buildVisibleProps } from '../build-visible-props'

describe('buildVisibleProps', () => {
  it('binds visible prop and event handler', () => {
    const hide = vi.fn()
    const result = buildVisibleProps({ title: 'A' }, true, 'modelValue', 'onUpdate:modelValue', hide)

    expect(result.title).toBe('A')
    expect(result.modelValue).toBe(true)
    expect(result['onUpdate:modelValue']).toBeTypeOf('function')
  })

  it('calls hide when visible event receives false', () => {
    const hide = vi.fn()
    const result = buildVisibleProps({}, true, 'modelValue', 'onUpdate:modelValue', hide)
    ;(result['onUpdate:modelValue'] as (v: unknown) => void)(false)
    expect(hide).toHaveBeenCalledOnce()
  })

  it('calls hide when visible event receives undefined', () => {
    const hide = vi.fn()
    const result = buildVisibleProps({}, true, 'open', 'onOpen', hide)
    ;(result.onOpen as (v: unknown) => void)(undefined)
    expect(hide).toHaveBeenCalledOnce()
  })

  it('does not call hide for truthy values', () => {
    const hide = vi.fn()
    const result = buildVisibleProps({}, true, 'open', 'onOpen', hide)
    ;(result.onOpen as (v: unknown) => void)(true)
    expect(hide).not.toHaveBeenCalled()
  })
})
