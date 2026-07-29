import { computed, defineComponent, h, nextTick, reactive, shallowRef } from 'vue'
import Vue from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayerInstanceStore } from '@/runtime/layer-instance'
import { createLayerApp } from '../create-layer-app'
import type { LayerHost } from '@/compat/types'
import { withoutDom } from '../../../tests-vue2/helpers/dom'
import { Container } from '../../../tests-vue2/fixtures/components'

/**
 * Vue 2.7-only: main unit vitest (Vue 3) excludes this file.
 * Runs via vitest.vue2-coverage.config.ts.
 */
function createTestApp() {
  const store = createLayerInstanceStore({
    create: computed(() => ({ container: { component: Container } })),
    use: computed(() => ({})),
  })
  const state = reactive({ visible: false })
  const host = shallowRef<LayerHost | null>(null)
  const layerApp = createLayerApp({
    store,
    state,
    host,
    onUpdateVisible: (value) => {
      if (value) return
      state.visible = false
    },
  })
  return { state, host, layerApp }
}

describe('createLayerApp (Vue 2.7)', () => {
  it('should expose mounted state matching mount lifecycle', async () => {
    const { state, layerApp } = createTestApp()
    expect(layerApp.mounted).toBe(false)
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)
    layerApp.unmount()
    expect(layerApp.mounted).toBe(false)
  })

  it('should mount with null host via package Vue constructor fallback', async () => {
    const { state, layerApp } = createTestApp()
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)
    expect(document.body.querySelector('motion-dialog')).toBeTruthy()
    layerApp.unmount()
  })

  it('should remount when host changes on next open', async () => {
    const Host = defineComponent({
      setup() {
        return () => h('div', { class: 'host' })
      },
    })
    const first = new Vue(Host as never)
    first.$mount()
    const second = new Vue(Host as never)
    second.$mount()

    const { state, host, layerApp } = createTestApp()
    host.value = first as unknown as LayerHost
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)

    host.value = second as unknown as LayerHost
    await nextTick()
    // Host change while visible is deferred until remount
    expect(layerApp.mounted).toBe(true)

    state.visible = false
    await nextTick()
    state.visible = true
    await nextTick()
    expect(layerApp.mounted).toBe(true)

    layerApp.unmount()
    first.$destroy()
    second.$destroy()
  })

  it('should stay unmounted when visible without DOM', () => {
    withoutDom(() => {
      const { state, layerApp } = createTestApp()
      expect(() => {
        state.visible = true
      }).not.toThrow()
      expect(layerApp.mounted).toBe(false)
    })
  })
})
