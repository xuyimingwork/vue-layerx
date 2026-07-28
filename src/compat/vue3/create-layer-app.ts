import * as Vue from 'vue'
import {
  defineComponent,
  h,
  watch,
  type ShallowRef,
} from 'vue'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import type { LayerClosePayload } from '@/types/confirm'
import { LayerView } from '@/runtime/layer-view'
import type { LayerAppHandle, LayerAppState, LayerHost } from '@/compat/types'
import { getSetupInstance } from './host'

const { createApp } = Vue

export type { LayerAppHandle, LayerAppState }

type Vue3Host = {
  appContext: object
  provides: Record<string | symbol, unknown>
}

function canUseDom(): boolean {
  return typeof document !== 'undefined'
}

function bridgeHost(instance: Vue3Host, host: Vue3Host | null) {
  if (!host) return

  const appContext = Object.create(host.appContext) as Vue3Host['appContext'] & {
    app: unknown
    provides: Record<string | symbol, unknown>
  }
  appContext.app = (instance.appContext as { app?: unknown }).app
  appContext.provides = Object.create(host.provides)
  instance.appContext = appContext
  instance.provides = Object.create(host.provides)
}

/**
 * Vue 3 LayerApp: `createApp` + one-shot host bridge at setup.
 *
 * Host changes while open are ignored on the live app; the next open remounts
 * LayerApp so setup re-bridges (same deferral as Vue 2.7, D3.6).
 */
export function createLayerApp(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<LayerHost | null>
  close: (payload?: LayerClosePayload) => void
}): LayerAppHandle {
  const { store, state, host, close } = options

  let el: HTMLElement | null = null
  let app: { mount: (el: Element) => void; unmount: () => void } | null = null
  let mountedHost: LayerHost | null | undefined

  const LayerApp = defineComponent({
    name: 'LayerApp',
    setup() {
      bridgeHost(
        getSetupInstance() as unknown as Vue3Host,
        host.value as Vue3Host | null,
      )

      return () =>
        h(LayerView, {
          visible: state.visible,
          store,
          'onUpdate:visible': (value: boolean, payload?: LayerClosePayload) => {
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
    if (!canUseDom()) return
    if (mountedHost !== host.value) unmount()
    if (app) return
    prepare()
    const hostInstance = host.value
    app = createApp!(LayerApp)
    app.mount(el!)
    mountedHost = hostInstance
  }

  function unmount() {
    if (!app) return
    app.unmount()
    app = null
    el!.remove()
    el = null
    mountedHost = undefined
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
