import type { ContentInstanceOptions } from '../types/content'
import type { LayerDefinitionOptions, LayerProps, LayerSlots } from '../types/layer'
import { mergeProps } from './merge-props'
import { mergeSlots } from './merge-slots'

export interface MergedConfig {
  layerProps: LayerProps
  contentProps: LayerProps
  hideOn: string[] | undefined
  /** Slots passed to content component (useDialog / show) */
  contentSlots: LayerSlots
  /** Slots passed to layer component (createLayerx / layer()) */
  layerSlots: LayerSlots
}

export interface MergeContext {
  factoryOptions: LayerDefinitionOptions
  layerDefinition: LayerDefinitionOptions | null
  useOptions: ContentInstanceOptions
  showOptions: ContentInstanceOptions
}

export function mergeConfig(ctx: MergeContext): MergedConfig {
  const layerProps = mergeProps(
    ctx.factoryOptions.props,
    ctx.layerDefinition?.props,
    ctx.useOptions.layer?.props,
    ctx.showOptions.layer?.props,
  )

  const contentProps = mergeProps(
    ctx.factoryOptions.content?.props,
    ctx.layerDefinition?.content?.props,
    ctx.useOptions.props,
    ctx.showOptions.props,
  )

  const hideOn = ctx.showOptions.hideOn ?? ctx.useOptions.hideOn

  const contentSlots = mergeSlots(ctx.useOptions.slots, ctx.showOptions.slots)

  const layerSlots = mergeSlots(
    ctx.factoryOptions.slots,
    ctx.layerDefinition?.slots,
    ctx.useOptions.layer?.slots,
    ctx.showOptions.layer?.slots,
  )

  return { layerProps, contentProps, hideOn, contentSlots, layerSlots }
}
