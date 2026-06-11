import type { LayerBindOptions, LayerProps, LayerUseOptions } from '../types'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  return Object.assign({}, ...sources.filter(Boolean))
}

export interface MergedLayerConfig {
  shellProps: LayerProps
  innerProps: LayerProps
  hideOn: string[] | undefined
}

export interface MergeContext {
  shellDefaults: LayerProps
  bindConfig: LayerBindOptions | null
  useOptions: LayerUseOptions
  showPayload: LayerProps
  showLayerProps: LayerProps
  showHideOn: string[] | undefined
}

export function mergeLayerConfig(ctx: MergeContext): MergedLayerConfig {
  const shellProps = mergeProps(
    ctx.shellDefaults,
    ctx.bindConfig?.props,
    ctx.useOptions.layer?.props,
    ctx.showLayerProps,
  )

  const innerProps = mergeProps(ctx.useOptions.props, ctx.showPayload)

  const hideOn =
    ctx.showHideOn ?? ctx.useOptions.hideOn ?? ctx.bindConfig?.hideOn

  return { shellProps, innerProps, hideOn }
}
