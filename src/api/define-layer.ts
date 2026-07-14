import { getCurrentInstance, inject, type MaybeRefOrGetter } from 'vue'
import type { LayerConfigStatic, LayerDefine } from '@/types'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import { withTemplateTo } from '@/shared/layer-template-to'

export function defineLayer(
  config: MaybeRefOrGetter<LayerConfigStatic> = {},
): LayerDefine {
  const instance = getCurrentInstance()
  if (!instance || instance.isMounted) {
    throw new Error(
      '[vue-layerx] defineLayer() must be called synchronously inside setup().',
    )
  }

  const ctx = inject(LAYER_VIEW_KEY, null)?.getDefineContext() ?? null
  const inLayer = !!ctx
  const outsideLayer = !inLayer

  ctx?.config(config)

  return withTemplateTo({ inLayer, outsideLayer }, {
    template({ name, render }) {
      if (!ctx) {
        return {
          render: () => render({ inLayer, outsideLayer, slotProps: {} }),
        }
      }

      ctx.template({
        name,
        render: (slotProps: Record<string, unknown> = {}) =>
          render({ slotProps, inLayer, outsideLayer }),
      })
      return { render: () => null }
    },
  })
}
