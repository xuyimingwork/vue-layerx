import {
  defineComponent,
  getCurrentInstance,
  provide,
  ref,
  watch,
  type PropType,
} from 'vue'
import { mergeFragment } from '@/pipeline/merge-node-config'
import { defaultResolve } from '@/pipeline/default-resolve'
import type { LayerAdapter, LayerConfigFragment, LayerRenderPlan } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import { createLayerFragment } from '@/instance/layer-fragment'
import type {
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/instance/layer-store'
import { renderLayerTree } from '@/render/render-layer-tree'
import { LAYER_DEFINE_KEY } from '@/di/injection-keys'
import { asViewHost, type ViewHost } from './view-host'

export const LayerView = defineComponent({
  name: 'LayerView',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    host: {
      type: Object as PropType<ViewHost | null>,
      default: null,
    },
    store: {
      type: Object as PropType<LayerInstanceStoreWithTemplate>,
      required: true,
    },
    viewStore: {
      type: Object as PropType<LayerViewStoreWithTemplate>,
      required: true,
    },
    adapter: {
      type: Function as PropType<LayerAdapter>,
      default: undefined,
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const contentMountKey = ref(0)

    watch(
      () => props.visible,
      (visible, prev) => {
        if (visible && !prev) {
          props.viewStore.define = createLayerFragment()
          props.viewStore['define:template'] = createLayerFragment()
          contentMountKey.value++
        }
      },
      { flush: 'sync' },
    )

    const bridgeHost = props.host
    if (bridgeHost && !bridgeHost.isUnmounted) {
      const instance = asViewHost(getCurrentInstance()!)
      instance.appContext = bridgeHost.appContext
      instance.provides = Object.create(bridgeHost.provides)
    }

    provide(LAYER_DEFINE_KEY, {
      register(fragment: LayerConfigFragment) {
        props.viewStore.define = fragment
      },
      store: props.viewStore,
    })

    return () => {
      props.store.track()
      props.viewStore.track()
      void contentMountKey.value

      const fragment = mergeFragment(
        props.store.create,
        props.viewStore['define:template'],
        props.viewStore.define,
        props.store['use:template'],
        props.store.use,
        props.store.open,
      )

      const merged = {
        container: fragment.container ?? {},
        content: fragment.content ?? {},
      }

      const close = () => emit('update:visible', false)

      const resolved = defaultResolve({ merged, close })
      const normalized = props.adapter ? props.adapter(resolved) : resolved

      const plan: LayerRenderPlan = {
        ...normalized,
        visible: props.visible,
        model: merged.container.model ?? DEFAULT_CONTAINER_MODEL,
        onClose: close,
      }

      return renderLayerTree({
        plan,
        contentMountKey: normalized.content ? contentMountKey.value : undefined,
      })
    }
  },
})
