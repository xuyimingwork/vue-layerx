import { describe, expect, it, vi } from 'vitest'
import { bindContainerModel, DEFAULT_CONTAINER_MODEL } from '../container-model'

describe('bindContainerModel', () => {
  it('binds model prop and update handler', () => {
    const close = vi.fn()
    const result = bindContainerModel({ title: 'A' }, true, 'modelValue', close)

    expect(result.title).toBe('A')
    expect(result.modelValue).toBe(true)
    result['onUpdate:modelValue']?.(false)
    expect(close).toHaveBeenCalled()
  })

  it('closes when update value is undefined', () => {
    const close = vi.fn()
    const result = bindContainerModel({}, true, 'modelValue', close)

    result['onUpdate:modelValue']?.(undefined)
    expect(close).toHaveBeenCalled()
  })

  it('supports custom model prop names', () => {
    const close = vi.fn()
    const result = bindContainerModel({}, true, 'open', close)

    expect(result.open).toBe(true)
    result['onUpdate:open']?.(false)
    expect(close).toHaveBeenCalled()
  })

  it('does not close when model stays true', () => {
    const close = vi.fn()
    const result = bindContainerModel({}, true, 'open', close)

    result['onUpdate:open']?.(true)
    expect(close).not.toHaveBeenCalled()
  })

  it('calls user onUpdate handler before close', () => {
    const close = vi.fn()
    const onUpdate = vi.fn()
    const result = bindContainerModel(
      { 'onUpdate:modelValue': onUpdate },
      true,
      'modelValue',
      close,
    )

    result['onUpdate:modelValue']?.(false)
    expect(onUpdate).toHaveBeenCalledWith(false)
    expect(close).toHaveBeenCalled()
  })

  it('calls user custom model onUpdate without closing when value stays true', () => {
    const close = vi.fn()
    const onUpdate = vi.fn()
    const result = bindContainerModel(
      { 'onUpdate:open': onUpdate },
      true,
      'open',
      close,
    )

    result['onUpdate:open']?.(true)
    expect(onUpdate).toHaveBeenCalledWith(true)
    expect(close).not.toHaveBeenCalled()
  })
})

describe('DEFAULT_CONTAINER_MODEL', () => {
  it('defaults to modelValue', () => {
    expect(DEFAULT_CONTAINER_MODEL).toBe('modelValue')
  })
})
