import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
} from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerInstance, LayerConfigInstance } from '@/types'
import { toFragmentFromInstance, mergeFragment } from '@/config/fragment'
import { attachLayerStore } from '@/runtime/layer-internal'
import { createLayerInstanceStore } from '@/runtime/layer-store'
import { createLayerView } from '@/runtime/layer-view-portal'
import { asViewHost, type ViewHost } from '@/types/view-host'

export function createLayerInstance({
  create,
  adapter,
  use,
}: {
  create: LayerConfigFragment
  adapter?: LayerAdapter
  use: LayerConfigFragment
}): LayerInstance {
  const store = createLayerInstanceStore({ create, use })

  const state = reactive({
    visible: false,
  })

  const host = shallowRef<ViewHost | null>(null)
  const view = createLayerView({ store, state, host, adapter })

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
        use: mergeFragment(use, toFragmentFromInstance(config)),
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
