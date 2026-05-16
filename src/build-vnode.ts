import { h, type Component, type VNode } from 'vue'
import type {
  LayerInstanceOptions,
  LayerProps,
  LayerShellOptions,
  SlotRenderFn,
} from './types'
import { bindCloseOn } from './utils/bind-close-on'
import { collectSlots } from './utils/collect-slots'
import { mergeProps } from './utils/merge-props'

export interface BuildVNodeContext {
  Shell: Component
  Inner: Component
  shellDefaults: LayerShellOptions
  instanceDefaults: LayerInstanceOptions
  visibleProp: string
  visibleEvent: string
  imperativeProps: LayerProps
  templateAttrs: LayerProps
  templateSlots: Record<string, SlotRenderFn>
  hide: () => void
}

export function buildLayerVNode(ctx: BuildVNodeContext): VNode {
  const hideHandler = () => ctx.hide()

  const innerProps = bindCloseOn(
    mergeProps(
      ctx.instanceDefaults.props,
      ctx.imperativeProps,
      ctx.templateAttrs,
    ),
    ctx.instanceDefaults.closeOn,
    hideHandler,
  )

  const shellProps = mergeProps(
    ctx.shellDefaults.props,
    ctx.instanceDefaults.shellProps,
    {
      [ctx.visibleProp]: true,
      [ctx.visibleEvent]: (value: unknown) => {
        if (value === false || value === undefined) hideHandler()
      },
    },
  )

  return h(ctx.Shell, shellProps, {
    default: () =>
      h(ctx.Inner, innerProps, collectSlots(ctx.templateSlots)),
  })
}
