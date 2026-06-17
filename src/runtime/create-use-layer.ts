import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
  type AppContext,
  type Component,
} from 'vue'
import type { DefineLayerOptions, LayerInstance, LayerUsePayload } from '@/core/types'
import { attachInternal } from '@/vue/instance/instance-registry'
import { createLayerInternalState } from '@/vue/instance/internal-state'
import { buildLayerRoot, type UseLayerContext } from './layer-root'
import { createLayerRuntime } from './layer-runtime'

interface CreateInstanceOptions {
  Content?: Component
  useOptions: LayerUsePayload
  partial: LayerUsePayload
  appContext: AppContext | null
  lifecycle: InstanceLifecycle
}

interface InstanceLifecycle {
  register: (dispose: () => void) => void
  dispose: () => void
}

function createInstanceLifecycle(): InstanceLifecycle {
  const disposers: (() => void)[] = []

  return {
    register(dispose) {
      disposers.push(dispose)
    },
    dispose() {
      for (const dispose of disposers.splice(0)) dispose()
    },
  }
}

interface LayerInstanceBundle {
  instance: LayerInstance
  dispose: () => void
}

function createInstance(ctx: UseLayerContext, opts: CreateInstanceOptions): LayerInstanceBundle {
  const internal = createLayerInternalState()
  const state = reactive({
    visible: false,
    showOptions: {} as LayerUsePayload,
    contentMountKey: 0,
  })
  const defineLayerConfig = shallowRef<DefineLayerOptions | null>(null)

  const hide = () => {
    state.visible = false
  }

  const LayerRoot = buildLayerRoot(ctx, opts, internal, state, defineLayerConfig, hide)
  const runtime = createLayerRuntime(LayerRoot, opts.appContext)

  const dispose = () => {
    state.visible = false
    runtime.unmount()
  }

  const show = (payload?: LayerUsePayload) => {
    defineLayerConfig.value = null
    if (payload) state.showOptions = payload
    state.contentMountKey++
    state.visible = true
    if (!runtime.mounted) runtime.mount()
  }

  const instance: LayerInstance = {
    show,
    hide,
    clone(partial?: LayerUsePayload) {
      const bundle = createInstance(ctx, {
        Content: opts.Content,
        useOptions: opts.useOptions,
        partial: partial ?? {},
        appContext: opts.appContext,
        lifecycle: opts.lifecycle,
      })
      opts.lifecycle.register(bundle.dispose)
      return bundle.instance
    },
    get visible() {
      return state.visible
    },
  }

  attachInternal(instance, internal)
  return { instance, dispose }
}

export function createUseLayer(ctx: UseLayerContext) {
  return function useLayer(
    Content?: Component,
    useOptions: LayerUsePayload = {},
  ): LayerInstance {
    const hostInstance = getCurrentInstance()
    const appContext = hostInstance?.appContext ?? null

    const lifecycle = createInstanceLifecycle()
    const { instance, dispose } = createInstance(ctx, {
      Content,
      useOptions,
      partial: {},
      appContext,
      lifecycle,
    })
    lifecycle.register(dispose)

    if (hostInstance) {
      onUnmounted(() => lifecycle.dispose())
    }

    return instance
  }
}
