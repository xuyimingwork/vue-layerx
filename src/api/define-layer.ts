import { inject } from 'vue'
import type { LayerConfigContainer, LayerDefine } from '@/types'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import { renderless, withTemplateTo } from '@/shared/layer-template-to'
import { hasSetupContext, type MaybeRefOrGetter } from '@/compat'

export function defineLayer(
  config: MaybeRefOrGetter<LayerConfigContainer> = {},
): LayerDefine {
  if (!hasSetupContext()) {
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
          dispose: () => {},
        }
      }

      const dispose = ctx.template({
        name,
        render: (slotProps: Record<string, unknown> = {}) => render(slotProps),
      })
      return { render: renderless, dispose }
    },
  })
}
