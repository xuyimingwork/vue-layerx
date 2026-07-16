import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  provide,
  Ref,
  ref,
  Teleport,
  toValue,
  watch,
  type ComponentInternalInstance,
  type MaybeRefOrGetter,
  type PropType,
  type VNode,
  type WritableComputedRef,
} from 'vue'
import { mergeFragment, createFragment, toFragmentFromContainer } from '@/config/fragment'
import { bindLayer } from '@/config/bind-layer'
import type { LayerConfigContainer, LayerConfigFragment, LayerNodeNormalized, LayerNormalized } from '@/types'
import type { LayerInstanceStoreWithTemplate } from '@/types/store'
import { createLayerStore } from '@/shared/layer-store'
import { LAYER_VIEW_KEY } from '@/shared/injection-keys'
import { LayerNoContainer } from '@/runtime/layer-no-container'

/** Marked on content root vnode by createLayerViewVNode; read in getDefineContext. */
const LAYER_CONTENT = Symbol('vue-layerx:layer-content')

function createParkingEl(): HTMLUnknownElement {
  const el = document.createElement('layer-content-parking')
  el.style.display = 'none'
  return el
}

/** Anchor when present; otherwise hidden parking so Teleport never uses disabled/in-place. */
function useRefContentTo(): WritableComputedRef<HTMLUnknownElement> {
  const anchorEl = ref<HTMLUnknownElement | null>(null)
  const parkingEl = createParkingEl()
  document.body.appendChild(parkingEl)
  onBeforeUnmount(() => parkingEl.remove())

  return computed({
    get: () => anchorEl.value ?? parkingEl,
    set: (el) => {
      anchorEl.value = el as HTMLUnknownElement | null
    },
  })
}

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
  refContentTo: Ref<HTMLUnknownElement>
}

/** Build LayerView root VNode (container + optional content). Exported for unit tests. */
export function createLayerViewVNode({
  container,
  content,
  openId,
  refContentTo
}: CreateLayerViewVNodeOptions): VNode | (VNode | null)[] | null {
  if (container.component === LayerNoContainer) {
    return createLayerViewContentVNode({ 
      key: openId, 
      content: content ? {
        ...content,
        props: {
          ...container.props,
          ...content.props
        },
      } : content
    })
  }

  return [
    h(container.component, container.props, {
      ...container.slots,
      default: () => h('layer-content-to', { 
        ref: (el) => refContentTo.value = el as HTMLUnknownElement,
        style: {
          display: 'contents'
        }
      }),  // 落点，不是 content
    }),
    h(Teleport, {
      to: refContentTo.value,
      defer: true,
    }, [
      createLayerViewContentVNode({ key: openId, content, marked: true })
    ])
  ]
}

function createLayerViewContentVNode({ key, content, marked }: {
  key: number | undefined
  content: LayerNodeNormalized | undefined
  marked?: boolean
}) {
  if (!content) return null
  return h(
    content.component,
    {
      ...content.props,
      key,
      [LAYER_CONTENT]: !!marked,
    },
    content.slots,
  )
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
    const refContentTo = useRefContentTo()
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
        defineStore.define = computed(() => createFragment()) as LayerConfigFragment
        defineStore['define:template'] = computed(() => createFragment()) as LayerConfigFragment
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
            ) as any
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
        refContentTo
      })
  },
})
