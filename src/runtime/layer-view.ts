import {
  App,
  createApp,
  defineComponent,
  h,
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
  let app: App | null = null

  function setupElement() {
    if (el) return
    el = document.createElement('div')
    document.body.appendChild(el)
  }

  function setupApp() {
    if (!canUseDom()) return
    if (app) return
    setupElement()
    app = createApp(defineComponent({
      setup() {
        return () => h(LayerView, {
          visible: state.visible,
          host: host.value,
          store,
          viewStore,
          adapter,
          'onUpdate:visible': (value: boolean) => {
            state.visible = value
          },
        })
      }
    }))
    app.mount(el)
  }

  watch(
    () => state.visible,
    () => {
      if (!state.visible) return
      setupApp()
    },
    { immediate: true },
  )

  return {
    get mounted() {
      return app !== null
    },
    unmount() {
      if (!app) return
      app.unmount()
      app = null
      el?.remove()
      el = null
    },
  }
}
