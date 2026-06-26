import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  type Component,
  type ComponentInternalInstance,
} from 'vue'
import type { LayerInstance, LayerConfigInstance } from '@/types'
import { toFragmentFromInstance } from '@/pipeline/to-fragment'
import { attachConfigStore } from '@/instance/instance-registry'
import { createLayerConfigStore, type LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { buildLayerView, type LayerViewState, type UseLayerContext } from './layer-view'
import { createLayerRuntime, type GetViewHost } from './layer-runtime'

interface CreateInstanceOptions {
  Content?: Component
  use: LayerConfigInstance
  clone: LayerConfigInstance
  getViewHost: GetViewHost
  bindHost: () => void
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
  const configStore: LayerConfigStoreWithRegistry = createLayerConfigStore({
    create: ctx.create,
    use: toFragmentFromInstance(opts.use),
    clone: toFragmentFromInstance(opts.clone),
    open: {},
  })

  const viewState = reactive<LayerViewState>({
    visible: false,
    contentMountKey: 0,
  })

  const close = () => {
    viewState.visible = false
  }

  const LayerView = buildLayerView(
    ctx,
    { Content: opts.Content },
    configStore,
    viewState,
    close,
    opts.getViewHost,
  )
  const runtime = createLayerRuntime(LayerView, opts.getViewHost)

  const dispose = () => {
    viewState.visible = false
    runtime.unmount()
  }

  const open = (config?: LayerConfigInstance) => {
    if (config !== undefined) {
      configStore.open = toFragmentFromInstance(config)
    }
    viewState.contentMountKey++
    viewState.visible = true
    if (!runtime.mounted) runtime.mount()
  }

  const instance: LayerInstance = {
    open,
    close,
    unmount: dispose,
    bindHost: opts.bindHost,
    clone(config?: LayerConfigInstance) {
      const bundle = createInstance(ctx, {
        Content: opts.Content,
        use: opts.use,
        clone: config ?? {},
        getViewHost: opts.getViewHost,
        bindHost: opts.bindHost,
        lifecycle: opts.lifecycle,
      })
      opts.lifecycle.register(bundle.dispose)
      return bundle.instance
    },
    get visible() {
      return viewState.visible
    },
  }

  attachConfigStore(instance, configStore)
  return { instance, dispose }
}

export function createUseLayer(ctx: UseLayerContext) {
  return function useLayer(
    Content?: Component,
    config: LayerConfigInstance = {},
  ): LayerInstance {
    let viewHost: ComponentInternalInstance | null = null
    const lifecycle = createInstanceLifecycle()

    const getViewHost = () => viewHost

    const bindHost = () => {
      const host = getCurrentInstance()
      if (!host || viewHost) return
      viewHost = host
      onUnmounted(() => {
        viewHost = null
        lifecycle.dispose()
      })
    }

    const { instance, dispose } = createInstance(ctx, {
      Content,
      use: config,
      clone: {},
      getViewHost,
      bindHost,
      lifecycle,
    })
    lifecycle.register(dispose)

    bindHost()

    return instance
  }
}
