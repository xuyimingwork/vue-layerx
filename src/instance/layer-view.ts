import {
  h,
  render,
  watch,
  type ShallowRef,
} from 'vue'
import type { LayerAdapter } from '@/types'
import type { LayerInstanceStoreWithTemplate } from '@/instance/layer-store'
import { createLayerViewStore } from '@/instance/layer-store'
import { LayerView } from './layer-view-component'
import { type ViewHost } from './view-host'

export interface LayerViewState {
  visible: boolean
}

export interface LayerViewHandle {
  readonly mounted: boolean
  unmount: () => void
}

export function createLayerView(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerViewState
  host: ShallowRef<ViewHost | null>
  adapter?: LayerAdapter
}): LayerViewHandle {
  const { store, state, host, adapter } = options

  const viewStore = createLayerViewStore()
  let container: HTMLElement | null = null

  function buildProps() {
    return {
      visible: state.visible,
      host: host.value,
      'onUpdate:visible': (value: boolean) => {
        state.visible = value
      },
      store,
      viewStore,
      adapter,
    }
  }

  function patchPortal() {
    if (!container) {
      container = document.createElement('div')
      document.body.appendChild(container)
    }
    render(h(LayerView, buildProps()), container)
  }

  watch(
    () => state.visible,
    (visible) => {
      if (!container && !visible) return
      patchPortal()
    },
    { flush: 'sync' },
  )

  watch(
    () => host.value,
    () => {
      if (container) patchPortal()
    },
    { flush: 'sync' },
  )

  return {
    get mounted() {
      return container !== null
    },
    unmount() {
      if (!container) return
      render(null, container)
      container.remove()
      container = null
    },
  }
}
