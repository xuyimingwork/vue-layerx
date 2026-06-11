import { h, type Component, type InjectionKey, type VNode } from 'vue'
import { bindHideOn } from './utils/bind-hide-on'
import { mergeLayerConfig, type MergeContext } from './utils/merge-config'
import type { LayerBindOptions, LayerProps } from './types'

export interface BuildVNodeOptions {
  Shell: Component
  Inner: Component
  visible: boolean
  visibleProp: string
  visibleEvent: string
  shellDefaults: LayerProps
  bindConfig: LayerBindOptions | null
  useOptions: MergeContext['useOptions']
  showPayload: LayerProps
  showLayerProps: LayerProps
  showHideOn: string[] | undefined
  slotsVersion: number
  hide: () => void
  provideContext: (inner: VNode) => VNode
}

function buildShellSlots(
  bindConfig: LayerBindOptions | null,
  slotsVersion: number,
): Record<string, () => VNode | VNode[] | null> {
  if (!bindConfig?.slots) return {}
  const shellSlots: Record<string, () => VNode | VNode[] | null> = {}
  for (const [name, slotRef] of Object.entries(bindConfig.slots)) {
    shellSlots[name] = () => {
      void slotsVersion
      return slotRef.value?.render() ?? null
    }
  }
  return shellSlots
}

export function buildLayerVNode(options: BuildVNodeOptions): VNode {
  const { shellProps, innerProps, hideOn } = mergeLayerConfig({
    shellDefaults: options.shellDefaults,
    bindConfig: options.bindConfig,
    useOptions: options.useOptions,
    showPayload: options.showPayload,
    showLayerProps: options.showLayerProps,
    showHideOn: options.showHideOn,
  })

  const hideHandler = () => options.hide()

  const boundInnerProps = bindHideOn(innerProps, hideOn, hideHandler)

  const shellVNodeProps = {
    ...shellProps,
    [options.visibleProp]: options.visible,
    [options.visibleEvent]: (value: unknown) => {
      if (value === false || value === undefined) hideHandler()
    },
  }

  const innerVNode = h(options.Inner, boundInnerProps)
  const wrappedInner = options.provideContext(innerVNode)

  return h(
    options.Shell,
    shellVNodeProps,
    {
      default: () => wrappedInner,
      ...buildShellSlots(options.bindConfig, options.slotsVersion),
    },
  )
}

export type LayerBindRegistry = {
  registerBind: (config: LayerBindOptions) => void
}

export function createLayerBindKey(): InjectionKey<LayerBindRegistry> {
  return Symbol('layerx-bind') as InjectionKey<LayerBindRegistry>
}

export const LAYER_SLOT_CONTEXT_KEY = Symbol('layerx-slot-context') as InjectionKey<{
  bumpSlots: () => void
}>
