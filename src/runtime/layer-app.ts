import {
  App,
  createApp,
  defineComponent,
  h,
  watch,
  type ShallowRef,
} from 'vue'
import type { LayerAdapter } from '@/types'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import { LayerView } from '@/view/layer-view'
import { type ViewHost } from '@/types/view-host'

export interface LayerAppState {
  visible: boolean
}

export interface LayerAppHandle {
  readonly mounted: boolean
  unmount: () => void
}

interface LayerAppContext {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<ViewHost | null>
  adapter?: LayerAdapter
}

function canUseDom(): boolean {
  return typeof document !== 'undefined'
}

function createLayerAppComponent(ctx: LayerAppContext) {
  const { store, state, host, adapter } = ctx
  return defineComponent({
    name: 'LayerApp',
    setup() {
      return () =>
        h(LayerView, {
          visible: state.visible,
          host: host.value,
          store,
          adapter,
          'onUpdate:visible': (value: boolean) => {
            state.visible = value
          },
        })
    },
  })
}

export function createLayerApp(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<ViewHost | null>
  adapter?: LayerAdapter
}): LayerAppHandle {
  const { store, state, host, adapter } = options
  const ctx: LayerAppContext = { store, state, host, adapter }

  let el: HTMLElement | null = null
  let layerApp: App | null = null

  function setupElement() {
    if (el) return
    el = document.createElement('div')
    document.body.appendChild(el)
  }

  function mountLayerApp() {
    if (!canUseDom()) return
    if (layerApp) return
    setupElement()
    layerApp = createApp(createLayerAppComponent(ctx))
    layerApp.mount(el!)
  }

  watch(
    () => state.visible,
    () => {
      if (!state.visible) return
      mountLayerApp()
    },
    { immediate: true },
  )

  return {
    get mounted() {
      return layerApp !== null
    },
    unmount() {
      if (!layerApp) return
      layerApp.unmount()
      layerApp = null
      el?.remove()
      el = null
    },
  }
}
