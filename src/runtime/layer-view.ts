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

  let el: HTMLElement | null = null

  function patch() {
    if (!canUseDom()) return
    if (!el) {
      el = document.createElement('div')
      document.body.appendChild(el)
    }
    render(
      h(LayerView, {
        visible: state.visible,
        host: host.value,
        'onUpdate:visible': (value: boolean) => {
          state.visible = value
        },
        store,
        viewStore,
        adapter,
      }),
      el,
    )
  }

  watch(
    [() => state.visible, () => host.value],
    () => {
      if (!el && !state.visible) return
      patch()
    },
    { flush: 'sync', immediate: true },
  )

  return {
    get mounted() {
      return el !== null
    },
    unmount() {
      if (!el) return
      render(null, el)
      el.remove()
      el = null
    },
  }
}
