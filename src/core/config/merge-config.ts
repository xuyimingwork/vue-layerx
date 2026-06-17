import type { DefineLayerOptions, LayerDefaults, LayerMerged } from '@/core/types/config'
import type { LayerUsePayload } from '@/core/types/payload'
import { mergeNodeConfig } from './merge-node-config'
import { pickContentConfig, pickLayerConfig } from './pick-payload'

export interface MergeContext {
  layerDefaults: LayerDefaults
  defineLayer: DefineLayerOptions | null
  useOptions: LayerUsePayload
  showOptions: LayerUsePayload
  partial?: LayerUsePayload
}

function defineLayerToConfig(
  defineLayer: DefineLayerOptions | null,
): LayerUsePayload | undefined {
  if (!defineLayer) return undefined
  return {
    layer: mergeNodeConfig(
      defineLayer.props ? { props: defineLayer.props } : undefined,
      defineLayer.layer,
    ),
  }
}

export function mergeConfig(ctx: MergeContext): LayerMerged {
  const defineLayerConfig = defineLayerToConfig(ctx.defineLayer)

  const content = mergeNodeConfig(
    ctx.layerDefaults.content,
    pickContentConfig(ctx.useOptions),
    pickContentConfig(ctx.partial),
    pickContentConfig(ctx.showOptions),
  )

  const layer = mergeNodeConfig(
    ctx.layerDefaults.layer,
    defineLayerConfig?.layer,
    pickLayerConfig(ctx.useOptions),
    pickLayerConfig(ctx.partial),
    pickLayerConfig(ctx.showOptions),
  )

  const hideOn =
    ctx.showOptions.hideOn ??
    ctx.partial?.hideOn ??
    ctx.useOptions.hideOn

  return { content, layer, hideOn }
}
