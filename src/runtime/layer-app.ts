import {
  ComponentInternalInstance,
  createVNode,
  defineComponent,
  h,
  render,
  VNode,
  watch,
  type ShallowRef,
} from 'vue'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import type { LayerClosePayload } from '@/types/confirm'
import { LayerView } from '@/runtime/layer-view'
import { type LayerHost } from '@/types/layer-host'

const HOST = Symbol('vue-layerx:host')

type LayerAppInstance = VNode & {
  [HOST]?: LayerHost | null
}

export interface LayerAppState {
  visible: boolean
}

export interface LayerAppHandle {
  readonly mounted: boolean
  unmount: () => void
}

function canUseDom(): boolean {
  return typeof document !== 'undefined'
}

function getAppContext(instance: ComponentInternalInstance) {
  const appContext = Object.create(instance?.appContext ?? null)
  appContext.provides = Object.create((instance as any)?.provides ?? null)
  return appContext
}

export function createLayerApp(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<LayerHost | null>
  close: (payload?: LayerClosePayload) => void
}): LayerAppHandle {
  const { store, state, host, close } = options

  let el: HTMLElement | null = null
  let app: LayerAppInstance | null = null

  const LayerApp = defineComponent({
    name: 'LayerApp',
    setup() {
      return () =>
        h(LayerView, {
          visible: state.visible,
          store,
          'onUpdate:visible': (value: boolean, payload?: LayerClosePayload) => {
            // LayerView only emits false; keep guard for v-model contract.
            /* v8 ignore next -- @preserve */
            if (value) return
            close(payload)
          },
        })
    },
  })

  function prepare() {
    el = document.createElement('div')
    document.body.appendChild(el)
  }

  function mount() {
    // 支持 SSR
    if (!canUseDom()) return
    // host 变化场景下重新挂载
    if (app && app[HOST] !== host.value) unmount()
    if (app) return
    prepare()
    app = createVNode(LayerApp)
    app[HOST] = host.value
    if (host.value) app.appContext = getAppContext(host.value)
    render(app, el!)
  }

  function unmount() {
    if (!app) return
    render(null, el!)
    el!.remove()
    el = null
    app = null
  }

  watch(
    () => state.visible,
    () => {
      if (!state.visible) return
      mount()
    },
    { immediate: true },
  )

  return {
    get mounted() {
      return app !== null
    },
    unmount,
  }
}
