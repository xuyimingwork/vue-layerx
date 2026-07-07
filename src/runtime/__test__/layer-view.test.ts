import { defineComponent, h, reactive, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createLayerInstanceStore } from '@/runtime/layer-instance'
import { createLayerView } from '@/runtime/layer-view'
import { ViewHost } from '@/types/view-host'
import { Container } from '@tests/fixtures/components'
import { withoutDom } from '@tests/helpers/dom'

function createTestView() {
  const store = createLayerInstanceStore({
    create: { container: { component: Container } },
  })
  const state = reactive({ visible: false })
  const host = shallowRef<ViewHost | null>(null)
  const view = createLayerView({ store, state, host })
  return { state, host, view }
}

describe('createLayerView', () => {
  it('should mount to document.body when visible becomes true', () => {
    const { state, view } = createTestView()
    state.visible = true
    expect(document.body.querySelector('div')).toBeTruthy()
    view.unmount()
  })

  it('should expose mounted state matching visibility', () => {
    const { state, view } = createTestView()
    expect(view.mounted).toBe(false)
    state.visible = true
    expect(view.mounted).toBe(true)
    view.unmount()
    expect(view.mounted).toBe(false)
  })

  it('should remove mount element from document.body when unmount is called', () => {
    const { state, view } = createTestView()
    state.visible = true
    expect(document.body.querySelector('div')).toBeTruthy()

    view.unmount()
    expect(document.body.querySelector('div')).toBeFalsy()
  })

  it('should not throw when unmount is called before first mount', () => {
    const { view } = createTestView()
    expect(() => view.unmount()).not.toThrow()
  })

  it('should hide layer without unmounting when visible becomes false', () => {
    const { state, view } = createTestView()
    state.visible = true
    expect(document.body.querySelector('motion-dialog')).toBeTruthy()

    state.visible = false
    expect(document.body.querySelector('motion-dialog')).toBeFalsy()
    expect(document.body.querySelector('div')).toBeTruthy()

    view.unmount()
  })

  it('should bridge host when host is set before visible becomes true', () => {
    const wrapper = mount(defineComponent({ template: '<div />' }))
    const { state, host, view } = createTestView()
    host.value = wrapper.vm.$ as ViewHost
    state.visible = true
    expect(view.mounted).toBe(true)
    view.unmount()
  })
})

describe('createLayerView / SSR', () => {
  it('should not throw and stay unmounted when visible becomes true without DOM', () => {
    withoutDom(() => {
      const { state, view } = createTestView()
      expect(() => {
        state.visible = true
      }).not.toThrow()
      expect(view.mounted).toBe(false)
      expect(document).toBeUndefined()
    })
  })

  it('should not throw when unmount is called without DOM and without prior mount', () => {
    withoutDom(() => {
      const { state, view } = createTestView()
      state.visible = true
      expect(() => view.unmount()).not.toThrow()
      expect(view.mounted).toBe(false)
    })
  })

  it('should mount when DOM becomes available and visible toggles', () => {
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

  it('should mount on create when visible and DOM are both available', () => {
    const store = createLayerInstanceStore({
      create: { container: { component: Container } },
    })
    const state = reactive({ visible: true })
    const host = shallowRef<ViewHost | null>(null)
    const view = createLayerView({ store, state, host })
    expect(view.mounted).toBe(true)
    view.unmount()
  })

  it('should patch host when host binds while visible without prior mount', () => {
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
