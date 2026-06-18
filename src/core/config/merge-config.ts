import type {
  DefineLayerOptions,
  LayerDefaults,
  LayerMerged,
  LayerNodeConfig,
} from '@/core/types/config'
import type { LayerUsePayload } from '@/core/types/payload'
import type { LayerTemplateRegistries } from '@/vue/instance/internal-state'
import { templateRegistryToNodeConfig } from './materialize-templates'
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

export function pickContainerConfig(
  payload: LayerUsePayload | undefined,
): LayerNodeConfig | undefined {
  return payload?.container
}

function pickSlotsFragment(
  config: LayerNodeConfig | undefined,
): LayerNodeConfig | undefined {
  if (!config?.slots) return undefined
  return { slots: config.slots }
}

export interface MergeContext {
  layerDefaults: LayerDefaults
  defineLayer: DefineLayerOptions | null
  useOptions: LayerUsePayload
  showOptions: LayerUsePayload
  partial?: LayerUsePayload
  /** LayerTemplate registries snapshotted at render; merged as slot tiers */
  templateTiers?: LayerTemplateRegistries
}

function defineLayerToConfig(
  defineLayer: DefineLayerOptions | null,
): LayerUsePayload | undefined {
  if (!defineLayer) return undefined
  const result: LayerUsePayload = {
    container: mergeNodeConfig(
      defineLayer.props ? { props: defineLayer.props } : undefined,
      defineLayer.container,
    ),
  }
  if (defineLayer.hideOn) result.hideOn = defineLayer.hideOn
  return result
}

/**
 * Container slot priority (low → high, later wins):
 * create > creator template > define > caller template > useX > partial > show
 */
function mergeContainerSlots(
  ctx: MergeContext,
  defineLayerConfig: LayerUsePayload | undefined,
): LayerNodeConfig['slots'] {
  return mergeNodeConfig(
    pickSlotsFragment(ctx.layerDefaults.container),
    templateRegistryToNodeConfig(ctx.templateTiers?.creatorContainer),
    pickSlotsFragment(defineLayerConfig?.container),
    templateRegistryToNodeConfig(ctx.templateTiers?.callerContainer),
    pickSlotsFragment(pickContainerConfig(ctx.useOptions)),
    pickSlotsFragment(pickContainerConfig(ctx.partial)),
    pickSlotsFragment(pickContainerConfig(ctx.showOptions)),
  ).slots
}

/**
 * Content slot priority (low → high, later wins):
 * create > caller template > useX > partial > show
 */
function mergeContentSlots(ctx: MergeContext): LayerNodeConfig['slots'] {
  return mergeNodeConfig(
    pickSlotsFragment(ctx.layerDefaults.content),
    templateRegistryToNodeConfig(ctx.templateTiers?.callerContent),
    pickSlotsFragment(pickContentConfig(ctx.useOptions)),
    pickSlotsFragment(pickContentConfig(ctx.partial)),
    pickSlotsFragment(pickContentConfig(ctx.showOptions)),
  ).slots
}

export function mergeConfig(ctx: MergeContext): LayerMerged {
  const defineLayerConfig = defineLayerToConfig(ctx.defineLayer)

  const contentBase = mergeNodeConfig(
    ctx.layerDefaults.content,
    pickContentConfig(ctx.useOptions),
    pickContentConfig(ctx.partial),
    pickContentConfig(ctx.showOptions),
  )

  const containerBase = mergeNodeConfig(
    ctx.layerDefaults.container,
    defineLayerConfig?.container,
    pickContainerConfig(ctx.useOptions),
    pickContainerConfig(ctx.partial),
    pickContainerConfig(ctx.showOptions),
  )

  const hideOn =
    ctx.showOptions.hideOn ??
    ctx.partial?.hideOn ??
    ctx.useOptions.hideOn ??
    defineLayerConfig?.hideOn

  return {
    content: { ...contentBase, slots: mergeContentSlots(ctx) },
    container: { ...containerBase, slots: mergeContainerSlots(ctx, defineLayerConfig) },
    hideOn,
  }
}
