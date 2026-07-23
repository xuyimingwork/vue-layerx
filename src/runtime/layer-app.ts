import {
  createApp,
  defineComponent,
  getCurrentInstance,
  h,
  ref,
  toValue,
  watch,
  type App,
  type MaybeRefOrGetter,
  type Ref,
  type ShallowRef,
} from 'vue'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import type { LayerClosePayload } from '@/types/confirm'
import { LayerView } from '@/runtime/layer-view'
import { type LayerHost } from '@/types/layer-host'

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
 * Inherit host globals / provide chain without stealing host's App identity.
 * Direct `appContext = host.appContext` makes DevTools resolve this tree under
 * the main app (instance.appContext.app), which throws when selecting nodes
 * (e.g. Cannot read properties of undefined (reading 'type')).
 */
function bridgeHost(instance: LayerHost, host: LayerHost | null) {
  if (!host) return

  const appContext = Object.create(host.appContext ?? null)
  // Keep createApp()'s App so DevTools stays on this LayerApp record.
  appContext.app = instance.appContext.app
  appContext.provides = Object.create(host.provides ?? null)

  instance.appContext = appContext
  instance.provides = Object.create(host.provides ?? null)
}

/** Keep current instance bridged to the latest host (does not remount children). */
function useBridgeHost(host: ShallowRef<LayerHost | null>) {
  const instance = getCurrentInstance() as LayerHost
  watch(
    () => host.value,
    (hostInstance) => bridgeHost(instance, hostInstance),
    { immediate: true },
  )
}

/**
 * Remount key for LayerView: bump only while visible when baked host is stale
 * (late bindHost takes effect on next open).
 */
function useHostViewKey(
  host: ShallowRef<LayerHost | null>,
  visible: MaybeRefOrGetter<boolean>,
): Ref<number> {
  const hostViewKey = ref(0)
  let viewHost: LayerHost | null | undefined

  watch(
    () => toValue(visible),
    (visible) => {
      if (!visible) return
      if (viewHost === host.value) return
      viewHost = host.value
      hostViewKey.value++
    },
    { immediate: true },
  )

  return hostViewKey
}

export function createLayerApp(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<LayerHost | null>
  close: (payload?: LayerClosePayload) => void
}): LayerAppHandle {
  const { store, state, host, close } = options

  let el: HTMLElement | null = null
  let app: App | null = null

  const LayerApp = defineComponent({
    name: 'LayerApp',
    setup() {
      useBridgeHost(host)
      const hostViewKey = useHostViewKey(host, () => state.visible)

      return () =>
        h(LayerView, {
          key: hostViewKey.value,
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
    if (app) return
    prepare()
    app = createApp(LayerApp)
    app.mount(el!)
  }

  function unmount() {
    if (!app) return
    app.unmount()
    app = null
    el!.remove()
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
      return app !== null
    },
    unmount,
  }
}
