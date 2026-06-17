import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { createBodyRenderer } from '../../../src/vue/render/body-renderer'

const Marker = defineComponent({
  setup() {
    return () => h('span', { class: 'body-marker' }, 'rendered')
  },
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createBodyRenderer', () => {
  it('appends container to document.body on first render', () => {
    const renderer = createBodyRenderer(null)
    renderer.render(h(Marker))

    expect(document.body.querySelector('.body-marker')).toBeTruthy()
    expect(document.body.querySelector('div')).toBeTruthy()
  })

  it('reuses container on subsequent renders', () => {
    const renderer = createBodyRenderer(null)
    renderer.render(h(Marker))
    const container = document.body.querySelector('div')
    renderer.render(h(Marker))
    expect(document.body.querySelector('div')).toBe(container)
  })

  it('teardown removes container and unmounts vnode', () => {
    const renderer = createBodyRenderer(null)
    renderer.render(h(Marker))
    expect(document.body.querySelector('.body-marker')).toBeTruthy()

    renderer.teardown()
    expect(document.body.querySelector('.body-marker')).toBeFalsy()
    expect(document.body.querySelector('div')).toBeFalsy()
  })

  it('teardown is safe when never rendered', () => {
    const renderer = createBodyRenderer(null)
    expect(() => renderer.teardown()).not.toThrow()
  })

  it('passes appContext to vnode when provided', () => {
    const wrapper = mount(defineComponent({ template: '<div />' }))
    const renderer = createBodyRenderer(wrapper.vm.$.appContext)
    renderer.render(h(Marker))
    expect(document.body.querySelector('.body-marker')).toBeTruthy()
    renderer.teardown()
  })
})
