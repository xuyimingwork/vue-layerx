import { getCurrentInstance, inject, type MaybeRefOrGetter } from 'vue'
import type { LayerConfigContainer, LayerDefine } from '@/types'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import { withTemplateTo } from '@/shared/layer-template-to'

export function defineLayer(
  config: MaybeRefOrGetter<LayerConfigContainer> = {},
): LayerDefine {
  const instance = getCurrentInstance()
  if (!instance || instance.isMounted) {
    throw new Error(
      '[vue-layerx] defineLayer() must be called synchronously inside setup().',
    )
  }

  const ctx = inject(LAYER_VIEW_KEY, null)?.getDefineContext() ?? null
  const exists = !!ctx

  ctx?.config(config)

  return withTemplateTo({ exists }, {
    template({ name, render }) {
      if (!ctx) {
        return {
          render: () => render({}),
        }
      }

      ctx.template({
        name,
        render: (slotProps: Record<string, unknown> = {}) => render(slotProps),
      })
      return { render: () => null }
    },
  })
}
