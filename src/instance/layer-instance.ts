import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
} from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerInstance, LayerConfigInstance } from '@/types'
import { toFragmentFromInstance } from '@/pipeline/to-fragment'
import { attachLayerStore } from '@/instance/layer-internal'
import { createLayerConfigStore } from '@/instance/layer-config-store'
import { createLayerView } from './layer-view'
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
  const store = createLayerConfigStore({
    create,
    adapter,
    use,
    clone,
  })

  const state = reactive({
    visible: false,
  })

  const host = shallowRef<ViewHost | null>(null)
  const view = createLayerView({ store, state, host })

  const dispose = () => {
    state.visible = false
    view.unmount()
  }

  const open = (config?: LayerConfigInstance) => {
    store.open = toFragmentFromInstance(config)
    state.visible = true
  }

  const close = () => {
    state.visible = false
  }

  const bindHost = () => {
    const current = getCurrentInstance()
    if (!current || host.value) return
    host.value = asViewHost(current)
    onUnmounted(() => {
      host.value = null
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
      return state.visible
    },
  }

  attachLayerStore(instance, store)
  return instance
}
