import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  provide,
  ref,
  toValue,
  watch,
  type ComponentInternalInstance,
  type MaybeRefOrGetter,
  type PropType,
  type VNode,
} from 'vue'
import { mergeFragment, createFragment, toFragmentFromContainer } from '@/config/fragment'
import { bindLayer } from '@/config/bind-layer'
import type { LayerConfigContainer, LayerNormalized } from '@/types'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import { createLayerStore } from '@/shared/layer-store'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'

/** Marked on content root vnode by createLayerViewVNode; read in getDefineContext. */
const LAYER_CONTENT = Symbol('vue-layerx:layer-content')

function isLayerContent(
  instance: ComponentInternalInstance | null | undefined,
): boolean {
  const vnodeProps = instance?.vnode?.props as
    | Record<PropertyKey, unknown>
    | null
    | undefined
  return vnodeProps?.[LAYER_CONTENT] === true
}

export interface CreateLayerViewVNodeOptions extends LayerNormalized {
  openId?: number
}

/** Build LayerView root VNode (container + optional content). Exported for unit tests. */
export function createLayerViewVNode({
  container,
  content,
  openId,
}: CreateLayerViewVNodeOptions): VNode {
  const defaultSlot = content
    ? () =>
        h(
          content.component,
          {
            ...content.props,
            key: openId,
            [LAYER_CONTENT]: true,
          },
          content.slots,
        )
    : () => null

  return h(container.component, container.props, {
    default: defaultSlot,
    ...container.slots,
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
  emits: ['update:visible'],
  setup(props, { emit }) {
    const openId = ref(0)
    const defineStore = createLayerStore({
      define: createFragment(),
      'define:template': createFragment(),
    })

    const close = () => emit('update:visible', false)

    /** Raw store tiers → single merge fragment (config domain). */
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

    /** Run factory adapter from create bucket. */
    const adapted = computed(() => {
      const adapter = props.store.create.adapter
      const fragment = merged.value
      return adapter ? adapter(fragment) : fragment
    })

    /** Adapt output + refs → bind-ready normalized tree. */
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
        defineStore.define = createFragment()
        defineStore['define:template'] = createFragment()
        openId.value++
      },
    )

    provide(LAYER_VIEW_KEY, {
      getDefineContext() {
        const instance = getCurrentInstance()
        if (!isLayerContent(instance)) return null

        return {
          config(source: MaybeRefOrGetter<LayerConfigContainer>) {
            defineStore.define = computed(() =>
              toFragmentFromContainer(toValue(source)),
            )
          },
          template({
            name,
            render,
          }: {
            name: string
            render: (slotProps?: Record<string, unknown>) => VNode | VNode[] | null
          }) {
            defineStore.template({
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

    return () =>
      createLayerViewVNode({
        container: bound.value.container,
        content: bound.value.content,
        openId: bound.value.content ? openId.value : undefined,
      })
  },
})
