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
import { withTemplateTo } from '@/shared/layer-template-to'
import { createLayerStore } from '@/shared/layer-store'
import { createLayerApp } from '@/runtime/layer-app'
import type { LayerHost } from '@/types/layer-host'

export function createLayerInstance({
  create,
  adapter,
  use,
}: {
  create: LayerConfigFragment
  adapter?: LayerAdapter
  use: LayerConfigFragment
}): LayerInstance {
  const containerRef = shallowRef<ComponentPublicInstance | null>(null)
  const contentRef = shallowRef<ComponentPublicInstance | null>(null)
  const store = createLayerInstanceStore({
    create,
    use,
    refs: {
      container: {
        props: {
          ref: (el: ComponentPublicInstance | null) => {
            containerRef.value = el
          },
        },
      },
      content: {
        props: {
          ref: (el: ComponentPublicInstance | null) => {
            contentRef.value = el
          },
        },
      },
    },
  })
  const state = reactive({
    visible: false,
  })
  const host = shallowRef<LayerHost | null>(null)
  
  const app = createLayerApp({ store, state, host, adapter })

  const dispose = () => {
    state.visible = false
    app.unmount()
  }

  const open = (config?: LayerConfigInstance) => {
    store.open = toFragmentFromInstance(config)
    state.visible = true
  }

  const close = () => {
    state.visible = false
  }

  const bindHost = () => {
    // 已绑定 host 状态下不允许再次绑定 host
    if (host.value) return
    const current = getCurrentInstance()
    // 只允许在 host setup 时绑定
    if (!current || current.isMounted) return

    host.value = current as LayerHost
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
    contentRef: computed(() => (state.visible ? contentRef.value : null)),
    containerRef: computed(() => (state.visible ? containerRef.value : null)),
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

  return withTemplateTo(instance, {
    template({ name, container, render }) {
      store.template({
        key: container ? 'use:template.container' : 'use:template.content',
        name,
        entry: {
          render: (slotProps: Record<string, unknown> = {}) => render(slotProps),
        },
      })
      return { render: () => null }
    },
  })
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
