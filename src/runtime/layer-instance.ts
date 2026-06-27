import {
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
} from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerInstance, LayerConfigInstance, LayerInstanceStoreInit, LayerInstanceStoreWithTemplate } from '@/types'
import { toFragmentFromInstance, mergeFragment, createFragment } from '@/config/fragment'
import { attachLayerStore } from '@/runtime/layer-internal'
import { createLayerView } from '@/runtime/layer-view'
import type { ViewHost } from '@/types/view-host'
import { createLayerStore } from '@/shared/layer-store'

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
    host.value = current as ViewHost
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

export function createLayerInstanceStore(
  init: LayerInstanceStoreInit,
): LayerInstanceStoreWithTemplate {
  return createLayerStore({
    create: createFragment(init.create),
    use: createFragment(init.use),
    open: createFragment(),
    'use:template': createFragment(),
  })
}
