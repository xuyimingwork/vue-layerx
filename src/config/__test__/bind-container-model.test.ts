import { describe, expect, it, vi } from 'vitest'
import { bindContainerModel, DEFAULT_CONTAINER_MODEL } from '../bind-container-model'

type UpdateFn = (value: unknown) => void

describe('bindContainerModel', () => {
  it('should bind model prop and update handler', () => {
    const close = vi.fn()
    const result = bindContainerModel({ title: 'A' }, true, 'modelValue', close)

    expect(result.title).toBe('A')
    expect(result.modelValue).toBe(true)
    ;(result['onUpdate:modelValue'] as UpdateFn | undefined)?.(false)
    expect(close).toHaveBeenCalled()
  })

  it('should close when update value is undefined', () => {
    const close = vi.fn()
    const result = bindContainerModel({}, true, 'modelValue', close)

    ;(result['onUpdate:modelValue'] as UpdateFn | undefined)?.(undefined)
    expect(close).toHaveBeenCalled()
  })

  it('should support custom model prop names', () => {
    const close = vi.fn()
    const result = bindContainerModel({}, true, 'open', close)

    expect(result.open).toBe(true)
    ;(result['onUpdate:open'] as UpdateFn | undefined)?.(false)
    expect(close).toHaveBeenCalled()
  })

  it('should not close when model stays true', () => {
    const close = vi.fn()
    const result = bindContainerModel({}, true, 'open', close)

    ;(result['onUpdate:open'] as UpdateFn | undefined)?.(true)
    expect(close).not.toHaveBeenCalled()
  })

  it('should call user onUpdate handler before close', () => {
    const close = vi.fn()
    const onUpdate = vi.fn()
    const result = bindContainerModel(
      { 'onUpdate:modelValue': onUpdate },
      true,
      'modelValue',
      close,
    )

    ;(result['onUpdate:modelValue'] as UpdateFn | undefined)?.(false)
    expect(onUpdate).toHaveBeenCalledWith(false)
    expect(close).toHaveBeenCalled()
  })

  it('should call user custom model onUpdate without closing when value stays true', () => {
    const close = vi.fn()
    const onUpdate = vi.fn()
    const result = bindContainerModel(
      { 'onUpdate:open': onUpdate },
      true,
      'open',
      close,
    )

    ;(result['onUpdate:open'] as UpdateFn | undefined)?.(true)
    expect(onUpdate).toHaveBeenCalledWith(true)
    expect(close).not.toHaveBeenCalled()
  })
})

describe('DEFAULT_CONTAINER_MODEL', () => {
  it('should default to modelValue', () => {
    expect(DEFAULT_CONTAINER_MODEL).toBe('modelValue')
  })
})
