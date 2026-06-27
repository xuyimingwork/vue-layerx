import {
  defineComponent,
  getCurrentInstance,
  provide,
  ref,
  watch,
  type PropType,
} from 'vue'
import { mergeFragment, createFragment } from '@/config/fragment'
import { bindLayerTree } from '@/config/bind-layer-tree'
import type { LayerAdapter, LayerConfigFragment } from '@/types'
import type {
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'
import { renderLayerTree } from '@/view/render-layer-tree'
import { LAYER_DEFINE_KEY } from '@/shared/contracts'
import type { ViewHost } from '@/types/view-host'

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
          props.viewStore.define = createFragment()
          props.viewStore['define:template'] = createFragment()
          contentMountKey.value++
        }
      },
      { flush: 'sync' },
    )

    const bridgeHost = props.host
    if (bridgeHost && !bridgeHost.isUnmounted) {
      const instance = getCurrentInstance()! as ViewHost
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

      const adapted = props.adapter ? props.adapter(merged) : merged
      const bound = bindLayerTree({ merged: adapted, visible: props.visible, close })

      return renderLayerTree({
        container: bound.container,
        content: bound.content,
        contentMountKey: bound.content ? contentMountKey.value : undefined,
      })
    }
  },
})
