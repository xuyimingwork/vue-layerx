import {
  computed,
  defineComponent,
  provide,
  ref,
  watch,
  type ComputedRef,
  type PropType,
} from 'vue'
import { mergeFragment, toFragmentFromContainer } from '@/config/fragment'
import { bindLayer } from '@/config/bind-layer'
import type { LayerBound, LayerConfigContainer } from '@/types'
import type { LayerClosePayload } from '@/types/confirm'
import type {
  LayerInstanceStoreWithTemplate,
  LayerStoreTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'
import { createLayerStore } from '@/runtime/layer-store'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import { noop } from '@/shared/noop'
import {
  getSetupInstance,
  isLayerContent,
  toValue,
  useLayerViewRender,
  type MaybeRefOrGetter,
} from '@/compat'

/** merge → adapt → refs → bind */
function useLayerBound({
  store,
  defineStore,
  visible,
  onUpdateVisible,
}: {
  store: LayerInstanceStoreWithTemplate
  defineStore: LayerViewStoreWithTemplate
  visible: ComputedRef<boolean>
  onUpdateVisible: (value: boolean, payload?: LayerClosePayload) => void
}): ComputedRef<LayerBound> {
  const close = (payload?: LayerClosePayload) => onUpdateVisible(false, payload)

  const merged = computed(() =>
    mergeFragment(
      store.create,
      defineStore['define:template'],
      defineStore.define,
      store['use:template'],
      store.use,
      store.open,
    ),
  )

  const adapted = computed(() => {
    const adapter = store.create.adapter
    const fragment = merged.value
    return adapter ? adapter(fragment) : fragment
  })

  const withRefs = computed(() => mergeFragment(store.refs, adapted.value))

  return computed(() =>
    bindLayer({
      fragment: withRefs.value,
      visible: visible.value,
      close,
    }),
  )
}

/**
 * Open counter: ++ on each visible false→true.
 * Distinct from `contentId` (content vnode key). LayerView currently feeds this
 * value to `useLayerViewRender` as contentId; slot keys use setup generation instead.
 */
function useOpenId(visible: ComputedRef<boolean>): ComputedRef<string> {
  const openId = ref(0)
  watch(
    visible,
    (current, prev) => {
      if (!current || prev) return
      openId.value++
    },
    {
      flush: 'sync',
      immediate: true,
    },
  )
  return computed(() => `${openId.value}`)
}

/** Inject bridge for defineLayer / creator LayerTemplate → defineStore. */
function provideLayerViewBridge(defineStore: LayerViewStoreWithTemplate) {
  provide(LAYER_VIEW_KEY, {
    getDefineContext() {
      const instance = getSetupInstance()
      if (!isLayerContent(instance)) return null

      let template: LayerStoreTemplate | undefined
      return {
        config(source: MaybeRefOrGetter<LayerConfigContainer>) {
          // Slot keying / LayerSlotFragment lives in store.setup (generation id).
          template = defineStore.setup(
            'define',
            computed(() => toFragmentFromContainer(toValue(source))),
          ).template
        },
        template({ name, render }) {
          if (!template) return noop
          return template({
            name,
            side: 'container',
            render,
          })
        },
      }
    },
  })
}

export const LayerView = defineComponent({
  name: 'LayerView',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    store: {
      type: Object as PropType<LayerInstanceStoreWithTemplate>,
      required: true,
    },
  },
  emits: {
    'update:visible': (_visible: boolean, _payload?: LayerClosePayload) => true,
  },
  setup(props, { emit }) {
    const visible = computed(() => props.visible)
    const defineStore = createLayerStore({})

    const openId = useOpenId(visible)

    provideLayerViewBridge(defineStore)

    const bound = useLayerBound({
      store: props.store,
      defineStore,
      visible,
      onUpdateVisible: (value, payload) => emit('update:visible', value, payload),
    })

    const render = useLayerViewRender(bound, visible)
    // contentId arg: today = openId only (not a full content-identity scheme).
    return () => render(openId.value)
  },
})
