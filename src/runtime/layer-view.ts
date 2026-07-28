import {
  computed,
  defineComponent,
  provide,
  ref,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import { mergeFragment, toFragmentFromContainer } from '@/config/fragment'
import { bindLayer } from '@/config/bind-layer'
import type { LayerConfigContainer } from '@/types'
import type { LayerClosePayload } from '@/types/confirm'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import { createLayerStore } from '@/shared/layer-store'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import {
  createLayerViewVNode,
  getSetupInstance,
  isLayerContent,
  toValue,
  useContentPlacement,
  type MaybeRefOrGetter,
} from '@/compat'

export { createLayerViewVNode } from '@/compat'

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
    const openId = ref(0)
    const defineStore = createLayerStore({
      define: computed(() => ({})),
      'define:template': {},
    })

    const close = (payload?: LayerClosePayload) =>
      emit('update:visible', false, payload)

    const merged = computed(() =>
      mergeFragment(
        props.store.create,
        defineStore['define:template'],
        defineStore.define,
        props.store['use:template'],
        props.store.use,
        props.store.open,
      ),
    )

    const adapted = computed(() => {
      const adapter = props.store.create.adapter
      const fragment = merged.value
      return adapter ? adapter(fragment) : fragment
    })

    const bound = computed(() =>
      bindLayer({
        fragment: mergeFragment(props.store.refs, adapted.value),
        visible: props.visible,
        close,
      }),
    )

    watch(
      () => props.visible,
      (visible, prev) => {
        if (!visible || prev) return
        openId.value++
      },
      { immediate: true },
    )

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
                  render(slotProps),
              },
            })
          },
        }
      },
    })

    const refContentTo = useContentPlacement(
      bound,
      computed(() => props.visible),
    )

    return () =>
      createLayerViewVNode({
        container: bound.value.container,
        content: bound.value.content,
        openId: bound.value.content ? openId.value : undefined,
        refContentTo,
      })
  },
})
