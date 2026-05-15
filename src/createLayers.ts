import {
  defineComponent,
  h,
  reactive,
  shallowRef,
  type Component,
  type SetupContext,
} from 'vue'
import type {
  LayerComponent,
  LayerInstanceOptions,
  LayerProps,
  LayerShellOptions,
  SlotRenderFn,
} from './types'

interface LayerState {
  visible: boolean
  /** Props passed imperatively via `.show(payload)`. */
  imperativeProps: LayerProps
}

function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  return Object.assign({}, ...sources.filter(Boolean))
}

function bindCloseOn(
  innerProps: LayerProps,
  events: string[] | undefined,
  hide: () => void,
): LayerProps {
  if (!events?.length) return innerProps
  const listeners: LayerProps = {}
  for (const event of events) {
    const key = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
    const prev = innerProps[key] as ((...args: unknown[]) => unknown) | undefined
    listeners[key] = (...args: unknown[]) => {
      prev?.(...args)
      hide()
    }
  }
  return { ...innerProps, ...listeners }
}

export function createLayers(
  Shell: Component,
  shellDefaults: LayerShellOptions = {},
) {
  const visibleProp = shellDefaults.visibleProp ?? 'modelValue'
  const visibleEvent =
    shellDefaults.visibleEvent ?? `update:${visibleProp}`

  return function useLayer(
    Inner: Component,
    instanceDefaults: LayerInstanceOptions = {},
  ): LayerComponent {
    const state = reactive<LayerState>({
      visible: false,
      imperativeProps: {},
    })

    const templateSlots = shallowRef<Record<string, SlotRenderFn>>({})

    const show = (payload?: LayerProps) => {
      if (payload) state.imperativeProps = { ...payload }
      state.visible = true
    }

    const hide = () => {
      state.visible = false
    }

    const Layer = defineComponent({
      name: `Layer_${(Inner as { name?: string }).name ?? 'Anonymous'}`,
      inheritAttrs: false,
      setup(_props, ctx: SetupContext) {
        templateSlots.value = ctx.slots as Record<string, SlotRenderFn>

        return () => {
          if (!state.visible) return null

          const hideHandler = () => hide()

          const innerProps = bindCloseOn(
            mergeProps(
              instanceDefaults.props,
              state.imperativeProps,
              ctx.attrs as LayerProps,
            ),
            instanceDefaults.closeOn,
            hideHandler,
          )

          const shellProps = mergeProps(shellDefaults.props, instanceDefaults.shellProps, {
            [visibleProp]: true,
            [visibleEvent]: (value: unknown) => {
              if (value === false || value === undefined) hideHandler()
            },
          })

          const slotFns = templateSlots.value
          const innerSlots: Record<string, SlotRenderFn> = {}
          for (const [name, fn] of Object.entries(slotFns)) {
            if (fn) innerSlots[name] = fn
          }

          return h(Shell, shellProps, {
            default: () =>
              h(
                Inner,
                innerProps,
                Object.keys(innerSlots).length ? innerSlots : undefined,
              ),
          })
        }
      },
    })

    const layer = Layer as unknown as LayerComponent
    layer.show = show
    layer.hide = hide
    Object.defineProperty(layer, 'visible', {
      get: () => state.visible,
    })

    return layer
  }
}
