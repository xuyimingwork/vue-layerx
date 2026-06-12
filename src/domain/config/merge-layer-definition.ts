import type { LayerDefinitionOptions } from '../types/layer'
import { mergeProps } from './merge-props'
import { mergeSlots } from './merge-slots'

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
