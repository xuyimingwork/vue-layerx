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
import { toPlatformVNodeData } from './platform-vnode'
import { resolveHostVue, type VueInstance } from './vue-ctor'

export type { LayerAppHandle, LayerAppState }

function canUseDom(): boolean {
  return typeof document !== 'undefined'
}

/**
 * Vue 2.7 LayerApp: `HostVue.extend` + `parent` for provide / globals (D0.8).
 *
 * Host changes while open are ignored on the live app; the next open remounts
 * LayerApp with the new `parent` (same deferral as Vue 3, D3.6).
 */
export function createLayerApp(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerAppState
  host: ShallowRef<LayerHost | null>
  close: (payload?: LayerClosePayload) => void
}): LayerAppHandle {
  const { store, state, host, close } = options

  let el: HTMLElement | null = null
  let vm: VueInstance | null = null
  let LayerCtor: (new (options?: object) => VueInstance) | null = null
  let bakedHost: LayerHost | null | undefined
  let mountedHost: LayerHost | null | undefined

  const LayerApp = defineComponent({
    name: 'LayerApp',
    setup() {
      return () =>
        h(
          LayerView,
          toPlatformVNodeData({
            visible: state.visible,
            store,
            'onUpdate:visible': (value: boolean, payload?: LayerClosePayload) => {
              /* v8 ignore next -- @preserve */
              if (value) return
              close(payload)
            },
          }) as never,
        )
    },
  })

  function ensureCtor(hostInstance: LayerHost | null) {
    if (LayerCtor && bakedHost === hostInstance) return LayerCtor
    const HostVue = resolveHostVue(hostInstance)
    LayerCtor = HostVue.extend(LayerApp)
    bakedHost = hostInstance
    return LayerCtor
  }

  function prepare() {
    el = document.createElement('div')
    document.body.appendChild(el)
  }

  function mount() {
    if (!canUseDom()) return
    if (mountedHost !== host.value) unmount()
    if (vm) return
    prepare()
    const hostInstance = host.value
    const Ctor = ensureCtor(hostInstance)
    vm = new Ctor(hostInstance ? { parent: hostInstance } : {})
    vm.$mount()
    el!.appendChild(vm.$el)
    mountedHost = hostInstance
  }

  function unmount() {
    if (!vm) return
    vm.$destroy()
    vm = null
    el?.remove()
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
      return vm !== null
    },
    unmount,
  }
}
