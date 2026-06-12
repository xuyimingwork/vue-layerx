import type { ContentInstanceOptions } from '../types/content'
import { mergeLayerDefinition } from './merge-layer-definition'
import { mergeProps } from './merge-props'
import { mergeSlots } from './merge-slots'

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
