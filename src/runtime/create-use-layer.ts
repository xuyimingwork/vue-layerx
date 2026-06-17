import {
  getCurrentInstance,
  h,
  onUnmounted,
  reactive,
  shallowRef,
  type AppContext,
  type Component,
} from 'vue'
import type { DefineLayerOptions, LayerInstance, LayerUsePayload } from '@/core/types'
import { attachInternal } from '@/vue/instance/instance-registry'
import { createLayerInternalState } from '@/vue/instance/internal-state'
import { createBodyRenderer } from '@/vue/render/body-renderer'
import { buildLayerRoot } from './layer-root'
import type { UseLayerFactoryContext } from './types'

interface CreateInstanceOptions {
  Content?: Component
  useOptions: LayerUsePayload
  partial: LayerUsePayload
  appContext: AppContext | null
}

function createInstance(ctx: UseLayerFactoryContext, opts: CreateInstanceOptions): LayerInstance {
  const bodyRenderer = createBodyRenderer(opts.appContext)
  const internal = createLayerInternalState()
  const state = reactive({
    visible: false,
    showOptions: {} as LayerUsePayload,
    contentMountKey: 0,
  })
  const defineLayerConfig = shallowRef<DefineLayerOptions | null>(null)

  const hide = () => {
    state.visible = false
    bodyRenderer.teardown()
  }

  const LayerRoot = buildLayerRoot(ctx, opts, internal, state, defineLayerConfig, hide)

  const show = (payload?: LayerUsePayload) => {
    defineLayerConfig.value = null
    if (payload) state.showOptions = payload
    state.contentMountKey++
    state.visible = true
    bodyRenderer.render(h(LayerRoot))
  }

  const instance: LayerInstance = {
    show,
    hide,
    clone(partial?: LayerUsePayload) {
      return createInstance(ctx, {
        Content: opts.Content,
        useOptions: opts.useOptions,
        partial: partial ?? {},
        appContext: opts.appContext,
      })
    },
    get visible() {
      return state.visible
    },
  }

  attachInternal(instance, internal)
  return instance
}

export function createUseLayer(ctx: UseLayerFactoryContext) {
  return function useLayer(
    Content?: Component,
    useOptions: LayerUsePayload = {},
  ): LayerInstance {
    const hostInstance = getCurrentInstance()
    const appContext = hostInstance?.appContext ?? null

    const instance = createInstance(ctx, {
      Content,
      useOptions,
      partial: {},
      appContext,
    })

    if (hostInstance) {
      onUnmounted(() => instance.hide())
    }

    return instance
  }
}
