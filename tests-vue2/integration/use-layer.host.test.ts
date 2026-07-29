import Vue, { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer } from 'vue-layerx'
import { flushPromises } from '../helpers/dom'
import { Container } from '../fixtures/components'

describe('LayerInstance.bindHost (Vue 2.7)', () => {
  describe('provide and inject', () => {
    it('should inherit provide/inject via Host parent', async () => {
      const KEY = 'layer-host-msg'
      let injected: string | undefined

      const Content = defineComponent({
        name: 'InjectContent',
        inject: {
          msg: { from: KEY, default: 'missing' },
        },
        created() {
          injected = (this as unknown as { msg: string }).msg
        },
        render(h) {
          return h('span', { class: 'msg' }, (this as unknown as { msg: string }).msg)
        },
      })

      const Host = defineComponent({
        provide: { [KEY]: 'from-host' },
        setup() {
          const dialog = createLayer(Container)(Content)
          dialog.open()
          return () => h('div', { class: 'test-host' })
        },
      })

      const vm = new Vue(Host as never)
      vm.$mount()
      document.body.appendChild(vm.$el)
      await flushPromises()
      expect(injected).toBe('from-host')
      vm.$destroy()
      vm.$el.remove()
    })
  })
})
