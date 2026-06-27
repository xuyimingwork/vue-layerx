import {
  computed,
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
  type ComponentPublicInstance,
} from 'vue'
import type { LayerAdapter, LayerConfigFragment, LayerInstance, LayerConfigInstance, LayerInstanceStoreInit, LayerInstanceStoreWithTemplate } from '@/types'
import { toFragmentFromInstance, mergeFragment, createFragment, stripFragment } from '@/config/fragment'
import { attachLayerStore } from '@/shared/layer-store-host'
import { createLayerView } from '@/runtime/layer-view'
import type { ViewHost } from '@/types/view-host'
import { createLayerStore } from '@/runtime/layer-store'

export function createLayerInstance({
  create,
  adapter,
  use,
}: {
  create: LayerConfigFragment
  adapter?: LayerAdapter
  use: LayerConfigFragment
}): LayerInstance {
  const containerTarget = shallowRef<ComponentPublicInstance | null>(null)
  const contentTarget = shallowRef<ComponentPublicInstance | null>(null)

  const store = createLayerInstanceStore({
    create,
    use,
    refs: {
      container: {
        props: {
          ref: (el: ComponentPublicInstance | null) => {
            containerTarget.value = el
          },
        },
      },
      content: {
        props: {
          ref: (el: ComponentPublicInstance | null) => {
            contentTarget.value = el
          },
        },
      },
    },
  })

  const state = reactive({
    visible: false,
  })

  const contentRef = computed(() => (state.visible ? contentTarget.value : null))
  const containerRef = computed(() => (state.visible ? containerTarget.value : null))

  const host = shallowRef<ViewHost | null>(null)
  const view = createLayerView({ store, state, host, adapter })

  const dispose = () => {
    state.visible = false
    view.unmount()
  }

  const open = (config?: LayerConfigInstance) => {
    store.open = toFragmentFromInstance(config)
    state.visible = true
  }

  const close = () => {
    state.visible = false
  }

  const bindHost = () => {
    const current = getCurrentInstance()
    if (!current || host.value) return
    host.value = current as ViewHost
    onUnmounted(() => {
      host.value = null
      dispose()
    })
  }

  const instance: LayerInstance = {
    open,
    close,
    unmount: dispose,
    bindHost,
    contentRef,
    containerRef,
    clone(config?: LayerConfigInstance) {
      const cloned = createLayerInstance({
        create,
        adapter,
        use: mergeFragment(
          stripFragment(use, (path) => path.endsWith('.props.ref')),
          toFragmentFromInstance(config),
        ),
      })
      cloned.bindHost()
      return cloned
    },
    get visible() {
      return state.visible
    },
  }

  attachLayerStore(instance, store)
  return instance
}

export function createLayerInstanceStore(
  init: LayerInstanceStoreInit,
): LayerInstanceStoreWithTemplate {
  return createLayerStore({
    create: createFragment(init.create),
    use: createFragment(init.use),
    open: createFragment(),
    'use:template': createFragment(),
    refs: createFragment(init.refs),
  })
}
