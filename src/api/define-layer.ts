import { getCurrentInstance, inject } from 'vue'
import type { LayerConfigStatic, LayerDefine } from '@/types'
import { toFragmentFromStatic } from '@/config/fragment'
import { isLayerContent, LAYER_DEFINE_KEY } from '@/shared/contracts'
import { withTemplateTo } from '@/shared/layer-template-to'

export function defineLayer(config: LayerConfigStatic = {}): LayerDefine {
  const instance = getCurrentInstance()
  if (!instance || instance.isMounted) {
    throw new Error(
      '[vue-layerx] defineLayer() must be called synchronously inside setup().',
    )
  }

  const ctx = inject(LAYER_DEFINE_KEY, null)
  const inLayer = !!(ctx && isLayerContent(instance))
  const outsideLayer = !inLayer

  if (inLayer) ctx!.register(toFragmentFromStatic(config))

  return withTemplateTo({ inLayer, outsideLayer }, {
    template({ name, render }) {
      if (outsideLayer) {
        return {
          render: () => render({ inLayer, outsideLayer, slotProps: {} }),
        }
      }

      ctx!.store.template({
        key: 'define:template.container',
        name,
        entry: {
          render: (slotProps: Record<string, unknown> = {}) =>
            render({ slotProps, inLayer, outsideLayer }),
        },
      })
      return { render: () => null }
    },
  })
}
