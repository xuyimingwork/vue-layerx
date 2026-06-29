import {
  h,
  render,
  watch,
  type ShallowRef,
} from 'vue'
import type { LayerAdapter } from '@/types'
import type {
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'
import { createLayerStore } from '@/runtime/layer-store'
import { LayerView } from '@/view/layer-view'
import { type ViewHost } from '@/types/view-host'
import { createFragment } from '@/config/fragment'

export interface LayerViewState {
  visible: boolean
}

export interface LayerViewHandle {
  readonly mounted: boolean
  unmount: () => void
}

export function createLayerViewStore(): LayerViewStoreWithTemplate {
  return createLayerStore({
    define: createFragment(),
    'define:template': createFragment(),
  })
}

function canUseDom(): boolean {
  return typeof document !== 'undefined'
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
    if (!canUseDom()) return
    if (!container) {
      container = document.createElement('div')
      document.body.appendChild(container)
    }
    render(h(LayerView, buildProps()), container)
  }

  watch(
    [() => state.visible, () => host.value],
    () => {
      if (!container && !state.visible) return
      patchPortal()
    },
    { flush: 'sync', immediate: true },
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
