import { defineComponent, h, reactive, shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createLayerInstanceStore } from '@/instance/layer-store'
import { createLayerView } from '@/instance/layer-view'
import { asViewHost } from '@/instance/view-host'
import { Container } from '@/__test__/fixtures/components'

function createTestView() {
  const store = createLayerInstanceStore({
    create: { container: { component: Container } },
  })
  const state = reactive({ visible: false })
  const host = shallowRef<ReturnType<typeof asViewHost> | null>(null)
  const view = createLayerView({ store, state, host })
  return { state, host, view }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createLayerView', () => {
  it('appends container to document.body on first visible', () => {
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

  it('unmount removes container', () => {
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

  it('hides layer when visible becomes false without removing portal container', () => {
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
    host.value = asViewHost(wrapper.vm.$)
    state.visible = true
    expect(view.mounted).toBe(true)
    view.unmount()
  })
})
