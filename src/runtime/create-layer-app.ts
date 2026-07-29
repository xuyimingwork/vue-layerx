import {
  defineComponent,
  h,
  watch,
  type ShallowRef,
} from 'vue'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import type { LayerClosePayload } from '@/types/confirm'
import type { LayerHost } from '@/types/instance'
import { LayerView } from '@/runtime/layer-view'
import {
  createPlatformRoot,
  toPlatformVNodeData,
  type PlatformRootHandle,
} from '@/compat'

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

/**
 * Mount LayerView into document.body while `state.visible` is used for open.
 * Platform attach lives in compat `createPlatformRoot` (`setup` / `mount` / `unmount`).
 */
export function createLayerApp(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<LayerHost | null>
  onUpdateVisible: (value: boolean, payload?: LayerClosePayload) => void
}): LayerAppHandle {
  const { store, state, host, onUpdateVisible } = options

  let el: HTMLElement | null = null
  let platform: PlatformRootHandle | null = null

  const LayerApp = defineComponent({
    name: 'LayerApp',
    setup() {
      platform!.setup()
      return () =>
        h(
          LayerView,
          toPlatformVNodeData({
            visible: state.visible,
            store,
            'onUpdate:visible': (value: boolean, payload?: LayerClosePayload) => {
              /* v8 ignore next -- @preserve */
              if (value) return
              onUpdateVisible(false, payload)
            },
          }) as never,
        )
    },
  })

  function prepare() {
    el = document.createElement('div')
    document.body.appendChild(el)
  }

  function mount() {
    if (!canUseDom()) return
    if (platform && platform.host !== host.value) unmount()
    if (platform) return
    prepare()
    platform = createPlatformRoot({ root: LayerApp, host: host.value })
    platform.mount(el!)
  }

  function unmount() {
    if (!platform) return
    platform.unmount()
    platform = null
    el?.remove()
    el = null
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
      return platform !== null
    },
    unmount,
  }
}
