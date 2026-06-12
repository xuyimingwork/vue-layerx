import { h, type Component, type InjectionKey, type VNode } from 'vue'
import { bindHideOn } from './utils/bind-hide-on'
import { mergeConfig, type MergeContext } from './utils/merge-config'
import type { CreateLayerxOptions, LayerDefinitionOptions, LayerSlots } from './types'

export interface BuildVNodeOptions {
  Layer: Component
  Content: Component
  visible: boolean
  visibleProp: string
  visibleEvent: string
  factoryOptions: CreateLayerxOptions
  layerDefinition: MergeContext['layerDefinition']
  useOptions: MergeContext['useOptions']
  showOptions: MergeContext['showOptions']
  slotsVersion: number
  hide: () => void
}

function buildSlotFns(
  slots: LayerSlots,
  slotsVersion: number,
): Record<string, () => VNode | VNode[] | null> {
  const slotFns: Record<string, () => VNode | VNode[] | null> = {}
  for (const [name, slotRef] of Object.entries(slots)) {
    slotFns[name] = () => {
      void slotsVersion
      return slotRef?.value?.render() ?? null
    }
  }
  return slotFns
}

export function buildLayerVNode(options: BuildVNodeOptions): VNode {
  const { layerProps, contentProps, hideOn, contentSlots, layerSlots } = mergeConfig({
    factoryOptions: options.factoryOptions,
    layerDefinition: options.layerDefinition,
    useOptions: options.useOptions,
    showOptions: options.showOptions,
  })

  const hideHandler = () => options.hide()

  const boundContentProps = bindHideOn(contentProps, hideOn, hideHandler)

  const layerVNodeProps = {
    ...layerProps,
    [options.visibleProp]: options.visible,
    [options.visibleEvent]: (value: unknown) => {
      if (value === false || value === undefined) hideHandler()
    },
  }

  return h(
    options.Layer,
    layerVNodeProps,
    {
      default: () =>
        h(options.Content, boundContentProps, buildSlotFns(contentSlots, options.slotsVersion)),
      ...buildSlotFns(layerSlots, options.slotsVersion),
    },
  )
}

export type LayerDefinitionRegistry = {
  registerLayer: (config: LayerDefinitionOptions) => void
}

export function createLayerDefinitionKey(): InjectionKey<LayerDefinitionRegistry> {
  return Symbol('layerx-definition') as InjectionKey<LayerDefinitionRegistry>
}

export const LAYER_SLOT_CONTEXT_KEY = Symbol('layerx-slot-context') as InjectionKey<{
  bumpSlots: () => void
}>
