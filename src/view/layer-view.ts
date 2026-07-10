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
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import { createLayerStore } from '@/shared/layer-store'
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
    adapter: {
      type: Function as PropType<LayerAdapter>,
      default: undefined,
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const contentMountKey = ref(0)
    const defineStore = createLayerStore({
      define: createFragment(),
      'define:template': createFragment(),
    })

    watch(
      () => props.visible,
      (visible, prev) => {
        if (visible && !prev) {
          defineStore.define = createFragment()
          defineStore['define:template'] = createFragment()
          contentMountKey.value++
        }
      },
      { flush: 'sync' },
    )

    watch(
      () => props.host,
      (bridgeHost) => {
        if (!bridgeHost || bridgeHost.isUnmounted) return
        const instance = getCurrentInstance()
        if (!instance) return
        const viewHost = instance as ViewHost
        viewHost.appContext = bridgeHost.appContext
        viewHost.provides = Object.create(bridgeHost.provides)
      },
      { immediate: true, flush: 'post' },
    )

    provide(LAYER_DEFINE_KEY, {
      register(fragment: LayerConfigFragment) {
        defineStore.define = fragment
      },
      store: defineStore,
    })

    return () => {
      props.store.track()
      defineStore.track()
      void contentMountKey.value

      const fragment = mergeFragment(
        props.store.create,
        defineStore['define:template'],
        defineStore.define,
        props.store['use:template'],
        props.store.use,
        props.store.open,
      )

      const close = () => emit('update:visible', false)

      const adapted = props.adapter ? props.adapter(fragment) : fragment
      const withRefs = mergeFragment(props.store.refs, adapted)
      const bound = bindLayerTree({ fragment: withRefs, visible: props.visible, close })

      return renderLayerTree({
        container: bound.container,
        content: bound.content,
        contentMountKey: bound.content ? contentMountKey.value : undefined,
      })
    }
  },
})
