import { h, type Component, type VNode } from 'vue'
import { LAYERX_DIRECT_CONTENT } from '../../../domain/constants/markers'
import { mergeConfig, type MergeContext } from '../../../domain/config/merge-config'
import { bindHideOn } from '../../../domain/events/bind-hide-on'
import { buildSlotFns } from './build-slot-fns'
import { buildVisibleProps } from './build-visible-props'

export interface BuildVNodeOptions {
  Layer: Component
  Content: Component
  visible: boolean
  visibleProp: string
  visibleEvent: string
  factoryOptions: MergeContext['factoryOptions']
  layerDefinition: MergeContext['layerDefinition']
  useOptions: MergeContext['useOptions']
  showOptions: MergeContext['showOptions']
  slotsVersion: number
  hide: () => void
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

  const layerVNodeProps = buildVisibleProps(
    layerProps,
    options.visible,
    options.visibleProp,
    options.visibleEvent,
    hideHandler,
  )

  return h(
    options.Layer,
    layerVNodeProps,
    {
      default: () =>
        h(
          options.Content,
          { ...boundContentProps, [LAYERX_DIRECT_CONTENT]: true },
          buildSlotFns(contentSlots, options.slotsVersion),
        ),
      ...buildSlotFns(layerSlots, options.slotsVersion),
    },
  )
}
