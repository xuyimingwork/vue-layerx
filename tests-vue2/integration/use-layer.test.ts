import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { createLayer } from 'vue-layerx'
import { flushPromises, mountSetup } from '../helpers/dom'
import {
  Container,
  DrawerContainer,
  makeContent,
  queryBodyDialog,
  VisibleModelContainer,
} from '../fixtures/components'

describe('useLayer / LayerInstance (Vue 2.7)', () => {
  describe('open and close', () => {
    it('should open and close with default value model', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>
      const host = mountSetup(() => {
        dialog = createLayer(Container)(makeContent())
      })

      dialog.open({
        props: { message: 'hi' },
        container: { props: { title: 'T' } },
      })
      await flushPromises()
      expect(queryBodyDialog()).toBeTruthy()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('T')
      expect(dialog.visible).toBe(true)

      dialog.close()
      await flushPromises()
      expect(queryBodyDialog()).toBeFalsy()
      expect(dialog.visible).toBe(false)
      host.destroy()
    })

    it('should close when container emits default value model', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>
      const host = mountSetup(() => {
        dialog = createLayer(Container)(makeContent())
      })

      dialog.open({ props: { message: 'hi' } })
      await flushPromises()
      expect(queryBodyDialog()).toBeTruthy()

      document.body.querySelector<HTMLButtonElement>('.close-via-model')?.click()
      await flushPromises()
      expect(dialog.visible).toBe(false)
      expect(queryBodyDialog()).toBeFalsy()
      host.destroy()
    })

    it('should bind and close with custom container model', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>
      const host = mountSetup(() => {
        dialog = createLayer(VisibleModelContainer, { model: 'visible' })(
          makeContent(),
        )
      })

      dialog.open({
        props: { message: 'hi' },
        container: { props: { title: 'Custom' } },
      })
      await flushPromises()
      expect(queryBodyDialog()?.getAttribute('data-model')).toBe('visible')
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Custom')

      document.body.querySelector<HTMLButtonElement>('.close-via-model')?.click()
      await flushPromises()
      expect(dialog.visible).toBe(false)
      host.destroy()
    })

    it('should open container without content', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>
      const host = mountSetup(() => {
        dialog = createLayer(Container)()
      })

      dialog.open({ container: { props: { title: 'Empty' } } })
      await flushPromises()
      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('Empty')
      expect(document.body.querySelector('.content')).toBeNull()
      host.destroy()
    })

    it('should remount content when container.component changes while open', async () => {
      let dialog!: ReturnType<ReturnType<typeof createLayer>>
      let mounts = 0

      const TrackingContent = defineComponent({
        name: 'TrackingContent',
        setup() {
          mounts++
          return () => h('span', { class: 'track' })
        },
      })

      const host = mountSetup(() => {
        dialog = createLayer(Container)(TrackingContent)
      })

      dialog.open()
      await flushPromises()
      const afterOpen = mounts

      dialog.open({ container: { component: DrawerContainer } })
      await flushPromises()
      expect(mounts).toBeGreaterThan(afterOpen)
      host.destroy()
    })

    it('should mount when opened outside setup', async () => {
      const dialog = createLayer(Container)(makeContent())
      dialog.open({ props: { message: 'no-host' } })
      await flushPromises()
      expect(queryBodyDialog()).toBeTruthy()
      expect(dialog.visible).toBe(true)
      dialog.unmount()
      await flushPromises()
      expect(queryBodyDialog()).toBeFalsy()
    })
  })
})
