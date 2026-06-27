import {
  defineComponent,
  getCurrentInstance,
  h,
  provide,
  ref,
  render,
  watch,
  type Component,
  type PropType,
  type ShallowRef,
} from 'vue'
import { mergeFragment } from '@/pipeline/merge-node-config'
import { defaultResolve } from '@/pipeline/default-resolve'
import type { LayerAdapter, LayerConfigFragment, LayerRenderPlan, LayerTemplateEntry } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import type { LayerInstanceStoreWithTemplate } from '@/instance/layer-store'
import { createLayerFragment } from '@/instance/layer-fragment'
import { createLayerViewStore } from '@/instance/layer-store'
import { renderLayerTree } from '@/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  CONTAINER_TEMPLATE_REGISTRY_KEY,
} from '@/di/injection-keys'
import { asViewHost, type ViewHost } from './view-host'

export interface LayerViewState {
  visible: boolean
}

export interface LayerViewHandle {
  readonly mounted: boolean
  unmount: () => void
}

export function createLayerView(options: {
  store: LayerInstanceStoreWithTemplate
  state: LayerViewState
  host: ShallowRef<ViewHost | null>
  adapter?: LayerAdapter
}): LayerViewHandle {
  const { store, state, host, adapter } = options

  const viewStore = createLayerViewStore()
  const contentMountKey = ref(0)
  let container: HTMLElement | null = null

  const contentComponent = store.use.content?.component as Component | undefined
  const contentName = contentComponent
    ? (contentComponent as { name?: string }).name ?? 'Anonymous'
    : 'Shell'

  const LayerView = defineComponent({
    name: `LayerView_${contentName}`,
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
      host: {
        type: Object as PropType<ViewHost | null>,
        default: null,
      },
      onClose: {
        type: Function as PropType<() => void>,
        required: true,
      },
    },
    setup(props) {
      const bridgeHost = props.host
      if (bridgeHost && !bridgeHost.isUnmounted) {
        const instance = asViewHost(getCurrentInstance()!)
        instance.appContext = bridgeHost.appContext
        instance.provides = Object.create(bridgeHost.provides)
      }

      provide(LAYER_DEFINE_KEY, {
        register(fragment: LayerConfigFragment) {
          viewStore.define = fragment
        },
      })

      provide(CONTAINER_TEMPLATE_REGISTRY_KEY, {
        template({
          name,
          entry,
        }: {
          name: string
          entry: LayerTemplateEntry
        }) {
          viewStore.template({
            key: 'define:template.container',
            name,
            entry,
          })
        },
      })

      return () => {
        store.track()
        viewStore.track()
        void contentMountKey.value

        const fragment = mergeFragment(
          store.create,
          viewStore['define:template'],
          viewStore.define,
          store['use:template'],
          store.use,
          store.open,
        )

        const merged = {
          container: fragment.container ?? {},
          content: fragment.content ?? {},
        }

        const resolved = defaultResolve({ merged, close: props.onClose })
        const normalized = adapter ? adapter(resolved) : resolved

        const plan: LayerRenderPlan = {
          ...normalized,
          visible: props.visible,
          model: merged.container.model ?? DEFAULT_CONTAINER_MODEL,
          onClose: props.onClose,
        }

        return renderLayerTree({
          plan,
          contentMountKey: normalized.content ? contentMountKey.value : undefined,
        })
      }
    },
  })

  const onClose = () => {
    state.visible = false
  }

  function buildProps() {
    return {
      visible: state.visible,
      host: host.value,
      onClose,
    }
  }

  function mountPortal() {
    if (!container) {
      container = document.createElement('div')
      document.body.appendChild(container)
    }
    render(h(LayerView, buildProps()), container)
  }

  function patchPortal() {
    if (!container) return
    render(h(LayerView, buildProps()), container)
  }

  watch(
    () => state.visible,
    (visible, prev) => {
      if (visible && !prev) {
        viewStore.define = createLayerFragment()
        viewStore['define:template'] = createLayerFragment()
        contentMountKey.value++
      }
      if (!container && !visible) return
      if (!container) mountPortal()
      else patchPortal()
    },
    { flush: 'sync' },
  )

  watch(
    () => host.value,
    () => {
      if (container) patchPortal()
    },
    { flush: 'sync' },
  )

  return {
    get mounted() {
      return container !== null
    },
    unmount() {
      if (!container) return
      render(null, container)
      container.remove()
      container = null
    },
  }
}
