import { computed, defineComponent, h, nextTick, reactive, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createLayerInstanceStore } from '@/runtime/layer-instance'
import { createLayerApp } from '@/runtime/layer-app'
import { LayerHost } from '@/types/layer-host'
import { Container } from '@tests/fixtures/components'
import { withoutDom } from '@tests/helpers/dom'

function createTestApp() {
  const store = createLayerInstanceStore({
    create: computed(() => ({ container: { component: Container } })),
    use: computed(() => ({})),
  })
  const state = reactive({ visible: false })
  const host = shallowRef<LayerHost | null>(null)
  const close = (payload?: { source?: string }) => {
    void payload
    state.visible = false
  }
  const layerApp = createLayerApp({ store, state, host, close })
  return { state, host, layerApp, close }
}

describe('createLayerApp', () => {
  it('should mount to document.body when visible becomes true', async () => {
    const { state, layerApp } = createTestApp()
    state.visible = true
    await nextTick()
    expect(document.body.querySelector('div')).toBeTruthy()
    layerApp.unmount()
  })

  it('should expose mounted state matching visibility', async () => {
    const { state, layerApp } = createTestApp()
    expect(layerApp.mounted).toBe(false)
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)
    layerApp.unmount()
    expect(layerApp.mounted).toBe(false)
  })

  it('should remove mount element from document.body when unmount is called', async () => {
    const { state, layerApp } = createTestApp()
    state.visible = true
    await nextTick()
    expect(document.body.querySelector('div')).toBeTruthy()

    layerApp.unmount()
    expect(document.body.querySelector('div')).toBeFalsy()
  })

  it('should not throw when unmount is called before first mount', () => {
    const { layerApp } = createTestApp()
    expect(() => layerApp.unmount()).not.toThrow()
  })

  it('should hide layer without unmounting when visible becomes false', async () => {
    const { state, layerApp } = createTestApp()
    state.visible = true
    await nextTick()
    expect(document.body.querySelector('motion-dialog')).toBeTruthy()

    state.visible = false
    await nextTick()
    expect(document.body.querySelector('motion-dialog')).toBeFalsy()
    expect(document.body.querySelector('div')).toBeTruthy()

    layerApp.unmount()
  })

  it('should bridge host when host is set before visible becomes true', async () => {
    const wrapper = mount(defineComponent({ template: '<div />' }))
    const { state, host, layerApp } = createTestApp()
    host.value = wrapper.vm.$ as LayerHost
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)
    layerApp.unmount()
  })

  it('should build appContext when host appContext and provides are nullish', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { state, host, layerApp } = createTestApp()
    host.value = { appContext: null, provides: null } as unknown as LayerHost
    state.visible = true
    await expect(nextTick()).rejects.toThrow()
    expect(layerApp.mounted).toBe(true)
    layerApp.unmount()
    warn.mockRestore()
  })
})

describe('createLayerApp / SSR', () => {
  it('should not throw and stay unmounted when visible becomes true without DOM', () => {
    withoutDom(() => {
      const { state, layerApp } = createTestApp()
      expect(() => {
        state.visible = true
      }).not.toThrow()
      expect(layerApp.mounted).toBe(false)
      expect(document).toBeUndefined()
    })
  })

  it('should not throw when unmount is called without DOM and without prior mount', () => {
    withoutDom(() => {
      const { state, layerApp } = createTestApp()
      state.visible = true
      expect(() => layerApp.unmount()).not.toThrow()
      expect(layerApp.mounted).toBe(false)
    })
  })

  it('should mount when DOM becomes available and visible toggles', async () => {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)
    const { state, layerApp } = createTestApp()
    state.visible = true
    expect(layerApp.mounted).toBe(false)

    vi.stubGlobal('document', originalDocument)
    state.visible = false
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)
    expect(document.body.querySelector('div')).toBeTruthy()
    layerApp.unmount()
  })

  it('should mount on create when visible and DOM are both available', () => {
    const store = createLayerInstanceStore({
      create: computed(() => ({ container: { component: Container } })),
      use: computed(() => ({})),
    })
    const state = reactive({ visible: true })
    const host = shallowRef<LayerHost | null>(null)
    const layerApp = createLayerApp({
      store,
      state,
      host,
      close: () => {
        state.visible = false
      },
    })
    expect(layerApp.mounted).toBe(true)
    layerApp.unmount()
  })

  it('should mount when visible toggles after DOM becomes available', async () => {
    const originalDocument = globalThis.document
    vi.stubGlobal('document', undefined)
    const { state, host, layerApp } = createTestApp()
    state.visible = true
    expect(layerApp.mounted).toBe(false)

    vi.stubGlobal('document', originalDocument)
    const wrapper = mount(defineComponent({ template: '<div />' }))
    host.value = wrapper.vm.$ as LayerHost
    state.visible = false
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)
    layerApp.unmount()
  })
})
