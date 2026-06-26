import {
  defineComponent,
  getCurrentInstance,
  h,
  provide,
  ref,
  render,
  shallowRef,
  watch,
  type Component,
  type PropType,
  type ShallowRef,
} from 'vue'
import { mergeLayerConfigStore } from '@/pipeline/merge-config'
import { defaultResolve } from '@/pipeline/default-resolve'
import type { LayerConfigFragment, LayerRenderPlan } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
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
  store: LayerConfigStoreWithRegistry
  state: LayerViewState
  host: ShallowRef<ViewHost | null>
}): LayerViewHandle {
  const { store, state, host } = options

  const defineFragment = shallowRef<LayerConfigFragment | null>(null)
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
          defineFragment.value = fragment
        },
      })

      provide(CONTAINER_TEMPLATE_REGISTRY_KEY, {
        registerCreatorContainerTemplate: store.registerCreatorContainerTemplate,
      })

      return () => {
        void defineFragment.value
        void store.open
        void store.templates.creatorContainer.container?.slots
        void store.templates.callerContainer.container?.slots
        void store.templates.callerContent.content?.slots
        void contentMountKey.value

        const merged = mergeLayerConfigStore(store, defineFragment.value)

        const resolved = defaultResolve({ merged, close: props.onClose })
        const normalized = store.adapter ? store.adapter(resolved) : resolved

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
        defineFragment.value = null
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
