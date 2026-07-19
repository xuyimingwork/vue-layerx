import {
  computed,
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
  toValue,
  type ComponentPublicInstance,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  LayerConfigFragment,
  LayerConfigFragmentCreate,
  LayerInstance,
  LayerConfigContent,
  LayerInstanceStoreInit,
  LayerInstanceStoreWithTemplate,
} from '@/types'
import {
  toFragmentFromContent,
  mergeFragment,
  stripFragment,
} from '@/config/fragment'
import { withTemplateTo } from '@/shared/layer-template-to'
import { createLayerStore } from '@/shared/layer-store'
import { createLayerApp } from '@/runtime/layer-app'
import { warn } from '@/shared/warn'
import type { LayerHost } from '@/types/layer-host'

export function createLayerInstance({
  create,
  use,
}: {
  create: ComputedRef<LayerConfigFragmentCreate>
  use: ComputedRef<LayerConfigFragment>
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
    } as LayerConfigFragment,
  })
  const state = reactive({
    visible: false,
  })
  const host = shallowRef<LayerHost | null>(null)

  const app = createLayerApp({ store, state, host })

  const dispose = () => {
    state.visible = false
    app.unmount()
  }

  const open = (config?: LayerConfigContent) => {
    store.open = toFragmentFromContent(config)
    state.visible = true
  }

  const close = () => {
    state.visible = false
  }

  const bindHost = ({ silent = false } = {}) => {
    const current = getCurrentInstance()

    if (host.value) {
      if (!silent && current && current !== host.value) {
        warn('bindHost() ignored: already bound to another host')
      }
      return
    }

    if (!current || current.isMounted) {
      if (!silent) {
        warn('bindHost() must be called synchronously during setup')
      }
      return
    }

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
    clone(config: MaybeRefOrGetter<LayerConfigContent> = {}) {
      return createLayerInstance({
        create,
        use: computed(() =>
          mergeFragment(
            stripFragment(use.value, (path) => path.endsWith('.props.ref')),
            toFragmentFromContent(toValue(config)),
          ),
        ),
      })
    },
    get visible() {
      return state.visible
    },
  }

  bindHost({ silent: true })

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
    create: init.create,
    use: init.use,
    'use:template': {},
    open: {},
    refs: init.refs,
  })
}
