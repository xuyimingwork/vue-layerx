import { defineComponent, h, onMounted, type Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createLayer, type LayerConfigContent, type LayerInstance } from '@/index'
import { flushPromises } from '@tests/helpers/dom'
import { makeContent } from '@tests/fixtures/components'

type UseLayer = ReturnType<typeof createLayer>

export async function mountOpenLayer(
  useLayer: UseLayer,
  options: {
    Content?: Component
    useConfig?: LayerConfigContent
    open?: (dialog: LayerInstance) => void
  } = {},
): Promise<{ dialog: LayerInstance; wrapper: VueWrapper }> {
  const Content = options.Content ?? makeContent()
  let dialog!: LayerInstance

  const wrapper = mount(
    defineComponent({
      setup() {
        dialog = useLayer(Content, options.useConfig)
        onMounted(() => {
          if (options.open) options.open(dialog)
          else dialog.open()
        })
        return () => h('motion-host')
      },
    }),
  )
  await flushPromises()
  return { dialog, wrapper }
}

export async function clickBodyButton(className: string, wrapper?: VueWrapper) {
  document.body.querySelector<HTMLButtonElement>(`.${className}`)?.click()
  if (wrapper) await wrapper.vm.$nextTick()
}

export async function closeViaModel(wrapper: VueWrapper) {
  await clickBodyButton('close-via-model', wrapper)
}
