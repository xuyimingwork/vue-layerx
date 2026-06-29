import { defineComponent, h, reactive, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLayerInstanceStore } from '@/runtime/layer-instance'
import { createLayerView } from '@/runtime/layer-view'
import { ViewHost } from '@/types/view-host'
import { Container } from '@tests/fixtures/components'

function createTestView() {
  const store = createLayerInstanceStore({
    create: { container: { component: Container } },
  })
  const state = reactive({ visible: false })
  const host = shallowRef<ViewHost | null>(null)
  const view = createLayerView({ store, state, host })
  return { state, host, view }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createLayerView', () => {
  it('mounts to document.body on first visible', () => {
    const { state, view } = createTestView()
    state.visible = true
    expect(document.body.querySelector('div')).toBeTruthy()
    view.unmount()
  })

  it('exposes mounted state', () => {
    const { state, view } = createTestView()
    expect(view.mounted).toBe(false)
    state.visible = true
    expect(view.mounted).toBe(true)
    view.unmount()
    expect(view.mounted).toBe(false)
  })

  it('unmount removes mount el from document.body', () => {
    const { state, view } = createTestView()
    state.visible = true
    expect(document.body.querySelector('div')).toBeTruthy()

    view.unmount()
    expect(document.body.querySelector('div')).toBeFalsy()
  })

  it('unmount is safe when never mounted', () => {
    const { view } = createTestView()
    expect(() => view.unmount()).not.toThrow()
  })

  it('hides layer when visible becomes false without unmounting', () => {
    const { state, view } = createTestView()
    state.visible = true
    expect(document.body.querySelector('motion-dialog')).toBeTruthy()

    state.visible = false
    expect(document.body.querySelector('motion-dialog')).toBeFalsy()
    expect(document.body.querySelector('div')).toBeTruthy()

    view.unmount()
  })

  it('bridges host when host is set before visible', () => {
    const wrapper = mount(defineComponent({ template: '<div />' }))
    const { state, host, view } = createTestView()
    host.value = wrapper.vm.$ as ViewHost
    state.visible = true
    expect(view.mounted).toBe(true)
    view.unmount()
  })
})

describe('createLayerView (SSR)', () => {
  function withoutDom<T>(run: () => T): T {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)
    try {
      return run()
    } finally {
      vi.stubGlobal('document', originalDocument)
    }
  }

  it('open without DOM does not throw and stays unmounted', () => {
    withoutDom(() => {
      const { state, view } = createTestView()
      expect(() => {
        state.visible = true
      }).not.toThrow()
      expect(view.mounted).toBe(false)
      expect(document).toBeUndefined()
    })
  })

  it('unmount without DOM is safe when never mounted', () => {
    withoutDom(() => {
      const { state, view } = createTestView()
      state.visible = true
      expect(() => view.unmount()).not.toThrow()
      expect(view.mounted).toBe(false)
    })
  })

  it('mounts after DOM is available when visible toggles', () => {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)
    const { state, view } = createTestView()
    state.visible = true
    expect(view.mounted).toBe(false)

    vi.stubGlobal('document', originalDocument)
    state.visible = false
    state.visible = true
    expect(view.mounted).toBe(true)
    expect(document.body.querySelector('div')).toBeTruthy()
    view.unmount()
  })

  it('mounts on create when visible and DOM are both available', () => {
    const store = createLayerInstanceStore({
      create: { container: { component: Container } },
    })
    const state = reactive({ visible: true })
    const host = shallowRef<ViewHost | null>(null)
    const view = createLayerView({ store, state, host })
    expect(view.mounted).toBe(true)
    view.unmount()
  })

  it('patches when host binds while visible without prior mount', () => {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)
    const { state, host, view } = createTestView()
    state.visible = true
    expect(view.mounted).toBe(false)

    vi.stubGlobal('document', originalDocument)
    const wrapper = mount(defineComponent({ template: '<div />' }))
    host.value = wrapper.vm.$ as ViewHost
    expect(view.mounted).toBe(true)
    view.unmount()
  })
})
