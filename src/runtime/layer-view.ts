import {
  defineComponent,
  getCurrentInstance,
  h,
  provide,
  ref,
  watch,
  type ComponentInternalInstance,
  type PropType,
  type VNode,
} from 'vue'
import { mergeFragment, createFragment, toFragmentFromStatic } from '@/config/fragment'
import { bindLayer } from '@/config/bind-layer'
import type { LayerAdapter, LayerConfigStatic, LayerNormalized } from '@/types'
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
    adapter: {
      type: Function as PropType<LayerAdapter>,
      default: undefined,
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const openId = ref(0)
    const defineStore = createLayerStore({
      define: createFragment(),
      'define:template': createFragment(),
    })

    watch(
      () => props.visible,
      (visible, prev) => {
        if (!visible || prev) return
        defineStore.define = createFragment()
        defineStore['define:template'] = createFragment()
        openId.value++
      }
    )

    provide(LAYER_VIEW_KEY, {
      getDefineContext() {
        const instance = getCurrentInstance()
        if (!isLayerContent(instance)) return null

        return {
          config(config: LayerConfigStatic) {
            defineStore.define = toFragmentFromStatic(config)
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

    return () => {
      props.store.track()
      defineStore.track()

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
      const bound = bindLayer({ fragment: withRefs, visible: props.visible, close })

      return createLayerViewVNode({
        container: bound.container,
        content: bound.content,
        openId: bound.content ? openId.value : undefined,
      })
    }
  },
})
