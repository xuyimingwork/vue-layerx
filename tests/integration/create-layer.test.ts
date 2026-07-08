import { defineComponent, h, onMounted } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createLayer, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { Container, makeContent, queryBodyDialog } from '@tests/fixtures/components'

const DrawerContainer = defineComponent({
  name: 'DrawerContainer',
  props: { modelValue: Boolean, size: String },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    return () =>
      props.modelValue
        ? h('motion-drawer', { 'data-size': props.size }, slots.default?.())
        : null
  },
})

async function mountOpenLayer(
  createConfig: Parameters<typeof createLayer>[1] = {},
  open: (dialog: LayerInstance) => void = (dialog) => dialog.open(),
) {
  const useLayer = createLayer(Container, createConfig)
  const Content = makeContent()
  let dialog!: LayerInstance

  const Host = defineComponent({
    setup() {
      dialog = useLayer(Content)
      onMounted(() => open(dialog))
      return () => h('motion-host')
    },
  })

  mount(Host)
  await flushPromises()
  return dialog
}

describe('createLayer', () => {
  it('should return useLayer that yields a LayerInstance with open, close, and clone', () => {
    const useLayer = createLayer(Container)
    const instance = useLayer(makeContent())

    expect(typeof useLayer).toBe('function')
    expect(typeof instance.open).toBe('function')
    expect(typeof instance.close).toBe('function')
    expect(typeof instance.clone).toBe('function')
  })

  describe('static config', () => {
    it('should apply container props from create config when layer is open', async () => {
      await mountOpenLayer(
        { props: { title: 'FactoryTitle', width: '480px' } },
        (dialog) => dialog.open({ props: { message: 'hi' } }),
      )

      expect(queryBodyDialog()?.getAttribute('data-title')).toBe('FactoryTitle')
      expect(queryBodyDialog()?.getAttribute('data-width')).toBe('480px')
    })

    it('should apply content props from create config when layer is open', async () => {
      await mountOpenLayer({ content: { props: { message: 'default-msg' } } })

      expect(document.body.querySelector('.msg')?.textContent).toBe('default-msg')
    })
  })

  describe('adapter', () => {
    it('should transform merged fragment before layer is rendered', async () => {
      await mountOpenLayer(
        {
          props: { title: 'DialogTitle', width: '520px' },
          adapter: (fragment) => ({
            ...fragment,
            container: {
              ...fragment.container!,
              component: DrawerContainer,
              props: {
                ...fragment.container?.props,
                width: undefined,
                size: '85vw',
              },
            },
          }),
        },
        (dialog) => dialog.open({ props: { message: 'adapted' } }),
      )

      expect(document.body.querySelector('motion-drawer')).toBeTruthy()
      expect(document.body.querySelector('motion-dialog')).toBeNull()
      expect(document.body.querySelector('motion-drawer')?.getAttribute('data-size')).toBe(
        '85vw',
      )
      expect(document.body.querySelector('.msg')?.textContent).toBe('adapted')
    })
  })
})
