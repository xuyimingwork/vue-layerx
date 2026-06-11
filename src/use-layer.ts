import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onUnmounted,
  provide,
  reactive,
  ref,
  shallowRef,
  type Component,
} from 'vue'
import {
  buildLayerVNode,
  createLayerBindKey,
  LAYER_SLOT_CONTEXT_KEY,
  type LayerBindRegistry,
} from './build-vnode'
import { createBodyRenderer } from './body-renderer'
import type { ResolvedShellConfig } from './shell-config'
import type {
  LayerBindOptions,
  LayerInstance,
  LayerProps,
  LayerShowPayload,
  LayerUseOptions,
} from './types'

export interface UseLayerFactoryContext extends ResolvedShellConfig {
  Shell: Component
}

function extractShowPayload(payload: LayerShowPayload = {}) {
  const { layer, hideOn, ...innerProps } = payload
  return {
    innerProps,
    layerProps: layer?.props ?? {},
    hideOn: hideOn as string[] | undefined,
  }
}

function mergeUseOptions(
  base: LayerUseOptions,
  partial?: LayerUseOptions,
): LayerUseOptions {
  if (!partial) return { ...base }
  return {
    props: { ...base.props, ...partial.props },
    layer: {
      props: { ...base.layer?.props, ...partial.layer?.props },
    },
    hideOn: partial.hideOn ?? base.hideOn,
  }
}

export function createUseLayer(ctx: UseLayerFactoryContext) {
  const { Shell, shellDefaults, visibleProp, visibleEvent } = ctx
  const bindKey = createLayerBindKey()

  function bind(options: LayerBindOptions = {}) {
    const registry = inject(bindKey, null)
    if (registry) registry.registerBind(options)
  }

  function useLayer(
    Inner: Component,
    useOptions: LayerUseOptions = {},
  ): LayerInstance {
    const state = reactive({
      visible: false,
      showPayload: {} as LayerProps,
      showLayerProps: {} as LayerProps,
      showHideOn: undefined as string[] | undefined,
    })

    const bindConfig = shallowRef<LayerBindOptions | null>(null)
    const slotsVersion = ref(0)

    const instance = getCurrentInstance()
    const bodyRenderer = createBodyRenderer(instance?.appContext ?? null)

    const hide = () => {
      state.visible = false
      bodyRenderer.teardown()
    }

    const LayerRoot = defineComponent({
      name: `LayerRoot_${(Inner as { name?: string }).name ?? 'Anonymous'}`,
      setup() {
        provide(bindKey, {
          registerBind: (config: LayerBindOptions) => {
            bindConfig.value = config
          },
        } satisfies LayerBindRegistry)

        provide(LAYER_SLOT_CONTEXT_KEY, {
          bumpSlots: () => {
            slotsVersion.value++
          },
        })

        return () => {
          if (!state.visible) return null
          return buildLayerVNode({
            Shell,
            Inner,
            visible: true,
            visibleProp,
            visibleEvent,
            shellDefaults,
            bindConfig: bindConfig.value,
            useOptions,
            showPayload: state.showPayload,
            showLayerProps: state.showLayerProps,
            showHideOn: state.showHideOn,
            slotsVersion: slotsVersion.value,
            hide,
            provideContext: (inner) => inner,
          })
        }
      },
    })

    const show = (payload?: LayerShowPayload) => {
      if (payload) {
        const extracted = extractShowPayload(payload)
        state.showPayload = extracted.innerProps
        state.showLayerProps = extracted.layerProps
        state.showHideOn = extracted.hideOn
      }
      state.visible = true
      bodyRenderer.render(h(LayerRoot))
    }

    const clone = (partial?: LayerUseOptions): LayerInstance =>
      useLayer(Inner, mergeUseOptions(useOptions, partial))

    if (instance) {
      onUnmounted(hide)
    }

    return {
      show,
      hide,
      clone,
      get visible() {
        return state.visible
      },
    }
  }

  useLayer.bind = bind

  return useLayer
}
