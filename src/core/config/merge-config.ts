import type {
  DefineLayerOptions,
  LayerDefaults,
  LayerMerged,
  LayerNodeConfig,
} from '@/core/types/config'
import type { LayerUsePayload } from '@/core/types/payload'
import { mergeNodeConfig } from './merge-node-config'

export function pickContentConfig(
  payload: LayerUsePayload | undefined,
): LayerNodeConfig | undefined {
  if (!payload) return undefined
  const result: LayerNodeConfig = {}
  if (payload.component !== undefined) result.component = payload.component
  if (payload.props !== undefined) result.props = payload.props
  if (payload.slots !== undefined) result.slots = payload.slots
  if (Object.keys(result).length === 0) return undefined
  return result
}

export function pickLayerConfig(
  payload: LayerUsePayload | undefined,
): LayerNodeConfig | undefined {
  return payload?.layer
}

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
  const result: LayerUsePayload = {
    layer: mergeNodeConfig(
      defineLayer.props ? { props: defineLayer.props } : undefined,
      defineLayer.layer,
    ),
  }
  if (defineLayer.hideOn) result.hideOn = defineLayer.hideOn
  return result
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
    ctx.useOptions.hideOn ??
    defineLayerConfig?.hideOn

  return { content, layer, hideOn }
}
