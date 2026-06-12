import type {
  ContentInstanceOptions,
  LayerDefinitionOptions,
  LayerProps,
  LayerSlots,
} from '../types'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  return Object.assign({}, ...sources.filter(Boolean))
}

export function mergeSlots(...sources: (LayerSlots | undefined)[]): LayerSlots {
  return Object.assign({}, ...sources.filter(Boolean))
}

export function mergeLayerDefinition(
  base?: LayerDefinitionOptions,
  partial?: LayerDefinitionOptions,
): LayerDefinitionOptions | undefined {
  if (!base && !partial) return undefined
  return {
    visible: partial?.visible ?? base?.visible,
    props: mergeProps(base?.props, partial?.props),
    slots: mergeSlots(base?.slots, partial?.slots),
    content: {
      props: mergeProps(base?.content?.props, partial?.content?.props),
    },
  }
}

export function mergeContentInstanceOptions(
  base: ContentInstanceOptions = {},
  partial?: ContentInstanceOptions,
): ContentInstanceOptions {
  if (!partial) return { ...base }
  return {
    props: mergeProps(base.props, partial.props),
    slots: mergeSlots(base.slots, partial.slots),
    hideOn: partial.hideOn ?? base.hideOn,
    layer: mergeLayerDefinition(base.layer, partial.layer),
  }
}

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
