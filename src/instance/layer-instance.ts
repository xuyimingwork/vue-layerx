import {
  getCurrentInstance,
  onUnmounted,
  reactive,
} from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerInstance, LayerConfigInstance } from '@/types'
import { toFragmentFromInstance } from '@/pipeline/to-fragment'
import { attachConfigStore } from '@/instance/instance-registry'
import { createLayerConfigStore } from '@/instance/layer-config-store'
import { buildLayerView, type LayerViewState } from './layer-view'
import { createLayerRuntime } from './layer-runtime'
import { asViewHost, type ViewHost } from './view-host'

export function createLayerInstance({
  create,
  adapter,
  use,
  clone,
}: {
  create: LayerConfigFragment
  adapter?: LayerAdapter
  use: LayerConfigFragment
  clone?: LayerConfigFragment
}): LayerInstance {
  const configStore = createLayerConfigStore({
    create,
    adapter,
    use,
    clone,
  })

  const viewState = reactive<LayerViewState>({
    visible: false,
    contentMountKey: 0,
  })

  let viewHost: ViewHost | null = null
  const getViewHost = () => viewHost

  const close = () => {
    viewState.visible = false
  }

  const LayerView = buildLayerView(configStore, {
    state: viewState,
    close,
    getViewHost,
  })
  const layerRuntime = createLayerRuntime(LayerView, getViewHost)

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

  const bindHost = () => {
    const host = getCurrentInstance()
    if (!host || viewHost) return
    viewHost = asViewHost(host)
    onUnmounted(() => {
      viewHost = null
      dispose()
    })
  }

  const instance: LayerInstance = {
    open,
    close,
    unmount: dispose,
    bindHost,
    clone(config?: LayerConfigInstance) {
      const cloned = createLayerInstance({
        create,
        adapter,
        use,
        clone: toFragmentFromInstance(config),
      })
      cloned.bindHost()
      return cloned
    },
    get visible() {
      return viewState.visible
    },
  }

  attachConfigStore(instance, configStore)
  return instance
}
