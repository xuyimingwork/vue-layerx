import {
  getCurrentInstance,
  onUnmounted,
  reactive,
} from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerInstance, LayerConfigInstance } from '@/types'
import { EMPTY_LAYER_FRAGMENT, toFragmentFromInstance } from '@/pipeline/to-fragment'
import { attachConfigStore } from '@/instance/instance-registry'
import {
  createLayerConfigStore,
  type LayerConfigStoreInit,
  type LayerConfigStoreWithRegistry,
} from '@/instance/layer-config-store'
import { buildLayerView, type LayerViewState } from './layer-view'
import { createLayerRuntime, type GetViewHost } from './layer-runtime'
import { asViewHost, type ViewHost } from './view-host'

interface InstanceLifecycle {
  register: (dispose: () => void) => void
  dispose: () => void
}

interface LayerInstanceRuntime {
  lifecycle: InstanceLifecycle
  getViewHost: GetViewHost
  bindHost: () => void
}

interface LayerInstanceBundle {
  instance: LayerInstance
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

function spawnLayerInstance(
  storeInit: LayerConfigStoreInit,
  runtime: LayerInstanceRuntime,
): LayerInstanceBundle {
  const configStore: LayerConfigStoreWithRegistry = createLayerConfigStore(storeInit)

  const viewState = reactive<LayerViewState>({
    visible: false,
    contentMountKey: 0,
  })

  const close = () => {
    viewState.visible = false
  }

  const LayerView = buildLayerView(configStore, {
    state: viewState,
    close,
    getViewHost: runtime.getViewHost,
  })
  const layerRuntime = createLayerRuntime(LayerView, runtime.getViewHost)

  const dispose = () => {
    viewState.visible = false
    layerRuntime.unmount()
  }

  const open = (config?: LayerConfigInstance) => {
    if (config !== undefined) {
      configStore.open = toFragmentFromInstance(config)
    }
    viewState.contentMountKey++
    viewState.visible = true
    if (!layerRuntime.mounted) layerRuntime.mount()
  }

  const instance: LayerInstance = {
    open,
    close,
    unmount: dispose,
    bindHost: runtime.bindHost,
    clone(config?: LayerConfigInstance) {
      const bundle = spawnLayerInstance(
        {
          create: storeInit.create,
          adapter: storeInit.adapter,
          use: storeInit.use,
          clone: toFragmentFromInstance(config ?? {}),
          open: EMPTY_LAYER_FRAGMENT,
        },
        runtime,
      )
      runtime.lifecycle.register(bundle.dispose)
      return bundle.instance
    },
    get visible() {
      return viewState.visible
    },
  }

  attachConfigStore(instance, configStore)
  return { instance, dispose }
}

export function createLayerInstance(opts: {
  create: LayerConfigFragment
  adapter?: LayerAdapter
  use: LayerConfigFragment
}): LayerInstanceBundle {
  const lifecycle = createInstanceLifecycle()
  let viewHost: ViewHost | null = null
  const getViewHost = () => viewHost
  const bindHost = () => {
    const host = getCurrentInstance()
    if (!host || viewHost) return
    viewHost = asViewHost(host)
    onUnmounted(() => {
      viewHost = null
      lifecycle.dispose()
    })
  }
  const runtime: LayerInstanceRuntime = { lifecycle, getViewHost, bindHost }

  const bundle = spawnLayerInstance(
    {
      create: opts.create,
      adapter: opts.adapter,
      use: opts.use,
      clone: EMPTY_LAYER_FRAGMENT,
      open: EMPTY_LAYER_FRAGMENT,
    },
    runtime,
  )
  lifecycle.register(bundle.dispose)
  return bundle
}
