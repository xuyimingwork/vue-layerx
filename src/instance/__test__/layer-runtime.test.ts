import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createLayerRuntime } from '../layer-runtime'
import { asViewHost } from '../view-host'

const Marker = defineComponent({
  setup() {
    return () => h('span', { class: 'body-marker' }, 'rendered')
  },
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createLayerRuntime', () => {
  it('appends container to document.body on first mount', () => {
    const runtime = createLayerRuntime(Marker, () => null)
    runtime.mount()

    expect(document.body.querySelector('.body-marker')).toBeTruthy()
    expect(document.body.querySelector('div')).toBeTruthy()
  })

  it('reuses container on subsequent mounts', () => {
    const runtime = createLayerRuntime(Marker, () => null)
    runtime.mount()
    const container = document.body.querySelector('div')
    runtime.mount()
    expect(document.body.querySelector('div')).toBe(container)
    expect(document.body.querySelectorAll('div')).toHaveLength(1)
  })

  it('exposes mounted state', () => {
    const runtime = createLayerRuntime(Marker, () => null)
    expect(runtime.mounted).toBe(false)
    runtime.mount()
    expect(runtime.mounted).toBe(true)
    runtime.unmount()
    expect(runtime.mounted).toBe(false)
  })

  it('unmount removes container and unmounts view', () => {
    const runtime = createLayerRuntime(Marker, () => null)
    runtime.mount()
    expect(document.body.querySelector('.body-marker')).toBeTruthy()

    runtime.unmount()
    expect(document.body.querySelector('.body-marker')).toBeFalsy()
    expect(document.body.querySelector('div')).toBeFalsy()
  })

  it('unmount is safe when never mounted', () => {
    const runtime = createLayerRuntime(Marker, () => null)
    expect(() => runtime.unmount()).not.toThrow()
  })

  it('passes appContext to view vnode when viewHost is alive', () => {
    const wrapper = mount(defineComponent({ template: '<div />' }))
    const host = wrapper.vm.$
    const runtime = createLayerRuntime(Marker, () => asViewHost(host))
    runtime.mount()
    expect(document.body.querySelector('.body-marker')).toBeTruthy()
    runtime.unmount()
  })
})
