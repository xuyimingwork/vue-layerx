import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  ref,
  shallowRef,
  type Component,
} from 'vue'
import { buildLayerVNode } from './build-vnode'
import { createBodyRenderer } from './body-renderer'
import { defineLayerComponent } from './define-layer-component'
import type { ResolvedShellConfig } from './shell-config'
import type {
  LayerComponent,
  LayerInstanceOptions,
  LayerProps,
  SlotRenderFn,
} from './types'

interface LayerState {
  visible: boolean
  imperativeProps: LayerProps
}

export interface UseLayerFactoryContext extends ResolvedShellConfig {
  Shell: Component
}

export function createUseLayer(ctx: UseLayerFactoryContext) {
  const { Shell, shellDefaults, visibleProp, visibleEvent } = ctx

  return function useLayer(
    Inner: Component,
    instanceDefaults: LayerInstanceOptions = {},
  ): LayerComponent {
    const state = reactive<LayerState>({
      visible: false,
      imperativeProps: {},
    })

    const templateAttrs = shallowRef<LayerProps>({})
    const templateSlots = shallowRef<Record<string, SlotRenderFn>>({})
    const bridged = ref(false)

    const instance = getCurrentInstance()
    const bodyRenderer = createBodyRenderer(instance?.appContext ?? null)

    const hide = () => {
      state.visible = false
      bodyRenderer.teardown()
    }

    const buildContext = () => ({
      Shell,
      Inner,
      shellDefaults,
      instanceDefaults,
      visibleProp,
      visibleEvent,
      imperativeProps: state.imperativeProps,
      templateAttrs: templateAttrs.value,
      templateSlots: templateSlots.value,
      hide,
    })

    const renderToBody = () => {
      if (!state.visible || bridged.value) return
      bodyRenderer.render(buildLayerVNode(buildContext()))
    }

    const show = (payload?: LayerProps) => {
      if (payload) state.imperativeProps = { ...payload }
      state.visible = true
      if (!bridged.value) renderToBody()
    }

    if (instance) {
      onUnmounted(hide)
    }

    const Layer = defineLayerComponent({
      Inner,
      bridged,
      isVisible: () => state.visible,
      templateAttrs,
      templateSlots,
      buildContext,
      bodyRenderer,
      renderToBody,
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
