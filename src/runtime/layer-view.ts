import {
  computed,
  defineComponent,
  provide,
  ref,
  watch,
  type ComputedRef,
  type PropType,
  type Ref,
  type VNode,
} from 'vue'
import { mergeFragment, toFragmentFromContainer } from '@/config/fragment'
import { bindLayer } from '@/config/bind-layer'
import type { LayerBound, LayerConfigContainer } from '@/types'
import type { LayerClosePayload } from '@/types/confirm'
import type {
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'
import { createLayerStore } from '@/shared/layer-store'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import {
  getSetupInstance,
  h,
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

/** Increment on each false→true open so content remounts with a fresh key. */
function useOpenId(visible: ComputedRef<boolean>): Ref<number> {
  const openId = ref(0)
  watch(
    visible,
    (next, prev) => {
      if (!next || prev) return
      openId.value++
    },
    { immediate: true },
  )
  return openId
}

/** Keyed parent for one open. Renders the default slot as-is, so the DOM gains no element. */
const LayerSlotFragment = defineComponent({
  name: 'LayerSlotFragment',
  setup(_, { slots }) {
    return () => slots.default?.() ?? null
  },
})

/** Inject bridge for defineLayer / creator LayerTemplate → defineStore. */
function provideLayerViewBridge(
  defineStore: LayerViewStoreWithTemplate,
  openId: ComputedRef<number>,
) {
  provide(LAYER_VIEW_KEY, {
    getDefineContext() {
      const instance = getSetupInstance()
      if (!isLayerContent(instance)) return null

      return {
        config(source: MaybeRefOrGetter<LayerConfigContainer>) {
          defineStore.define = computed(() =>
            toFragmentFromContainer(toValue(source)),
          ) as never
        },
        template({
          name,
          render,
        }: {
          name: string
          render: (slotProps?: Record<string, unknown>) => VNode | VNode[] | null
        }) {
          return defineStore.template({
            key: 'define:template.container',
            name,
            entry: {
              render: (slotProps: Record<string, unknown> = {}) =>
                h(LayerSlotFragment, { key: openId.value }, () => render(slotProps)),
            },
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
    const openId = useOpenId(visible)
    const defineStore = createLayerStore({
      define: computed(() => ({})),
      'define:template': {},
    })

    provideLayerViewBridge(
      defineStore,
      computed(() => openId.value),
    )

    const bound = useLayerBound({
      store: props.store,
      defineStore,
      visible,
      onUpdateVisible: (value, payload) => emit('update:visible', value, payload),
    })

    const render = useLayerViewRender(bound, visible)
    return () => render(openId.value)
  },
})
