import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  type AppContext,
  type Component,
} from 'vue'
import type { LayerInstance, LayerConfigInstance } from '@/types'
import { toFragmentFromInstance } from '@/pipeline/to-fragment'
import { attachConfigStore } from '@/instance/instance-registry'
import { createLayerConfigStore, type LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { buildLayerRoot, type LayerRootState, type UseLayerContext } from './layer-root'
import { createLayerRuntime } from './layer-runtime'

interface CreateInstanceOptions {
  Content?: Component
  use: LayerConfigInstance
  clone: LayerConfigInstance
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
  const configStore: LayerConfigStoreWithRegistry = createLayerConfigStore({
    create: ctx.create,
    use: toFragmentFromInstance(opts.use),
    clone: toFragmentFromInstance(opts.clone),
    open: {},
  })

  const rootState = reactive<LayerRootState>({
    visible: false,
    contentMountKey: 0,
  })

  const close = () => {
    rootState.visible = false
  }

  const LayerRoot = buildLayerRoot(ctx, { Content: opts.Content }, configStore, rootState, close)
  const runtime = createLayerRuntime(LayerRoot, opts.appContext)

  const dispose = () => {
    rootState.visible = false
    runtime.unmount()
  }

  const open = (config?: LayerConfigInstance) => {
    if (config !== undefined) {
      configStore.open = toFragmentFromInstance(config)
    }
    rootState.contentMountKey++
    rootState.visible = true
    if (!runtime.mounted) runtime.mount()
  }

  const instance: LayerInstance = {
    open,
    close,
    clone(config?: LayerConfigInstance) {
      const bundle = createInstance(ctx, {
        Content: opts.Content,
        use: opts.use,
        clone: config ?? {},
        appContext: opts.appContext,
        lifecycle: opts.lifecycle,
      })
      opts.lifecycle.register(bundle.dispose)
      return bundle.instance
    },
    get visible() {
      return rootState.visible
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
    const hostInstance = getCurrentInstance()
    const appContext = hostInstance?.appContext ?? null

    const lifecycle = createInstanceLifecycle()
    const { instance, dispose } = createInstance(ctx, {
      Content,
      use: config,
      clone: {},
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
