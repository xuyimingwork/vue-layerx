import type { DefineLayerOptions, LayerFactoryDefaults, LayerMerged } from '../types/layer'
import type { LayerUsePayload } from '../types/content'
import { mergeNodeConfig } from './merge-node-config'

export interface MergeContext {
  factoryDefaults: LayerFactoryDefaults
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

function factoryDefaultsToConfig(
  factoryDefaults: LayerFactoryDefaults,
): LayerUsePayload {
  return {
    content: factoryDefaults.content,
    layer: factoryDefaults.layer,
  }
}

export function mergeConfig(ctx: MergeContext): LayerMerged {
  const defineLayerConfig = defineLayerToConfig(ctx.defineLayer)
  const factoryConfig = factoryDefaultsToConfig(ctx.factoryDefaults)

  const content = mergeNodeConfig(
    factoryConfig.content,
    ctx.useOptions,
    ctx.partial,
    ctx.showOptions,
  )

  const layer = mergeNodeConfig(
    factoryConfig.layer,
    defineLayerConfig?.layer,
    ctx.useOptions.layer,
    ctx.partial?.layer,
    ctx.showOptions.layer,
  )

  const hideOn =
    ctx.showOptions.hideOn ??
    ctx.partial?.hideOn ??
    ctx.useOptions.hideOn

  return { content, layer, hideOn }
}
