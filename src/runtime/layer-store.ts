import {
  computed,
  defineComponent,
  onUnmounted,
  reactive,
  shallowRef,
  type ComputedRef,
  type UnwrapNestedRefs,
} from 'vue'
import type { LayerConfigFragment, LayerSlotRender } from '@/types/config'
import type {
  LayerStoreKey,
  LayerConfigFragmentSide,
  LayerStoreTemplate,
  LayerStoreMethods,
} from '@/types/store'
import { del, hasSetupContext, h, set, toComponentRoot } from '@/compat'
import { noop } from '@/shared/noop'
import { warn } from '@/shared/warn'

export type {
  LayerStoreKey,
  LayerConfigFragmentSide,
  LayerStoreTemplate,
  LayerStoreMethods,
  LayerInstanceStore,
  LayerViewStore,
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'

/** Stable empty fragment for idle getters; frozen so accidental writes fail loudly. */
const EMPTY: LayerConfigFragment = Object.freeze({}) as LayerConfigFragment

/** Module-wide generation ids for LayerSlotFragment keys (unique across stores). */
let uid = 0

/**
 * Keyed parent for one setup generation. Passthrough default slot; Vue 2
 * multi-child gets a `<layer-fragment>` shell via `toComponentRoot` (no Fragment).
 */
const LayerSlotFragment = defineComponent({
  name: 'LayerSlotFragment',
  setup(_, { slots }) {
    return () => toComponentRoot(slots.default?.() ?? null)
  },
})

type SlotToRender = (
  name: string,
  render: LayerSlotRender,
) => LayerSlotRender

type Scope = {
  readonly fragment: LayerConfigFragment
  readonly template: LayerConfigFragment
  begin: (source: ComputedRef<LayerConfigFragment>) => number
  /** Tear down only when `id` is still the active generation. */
  clear: (id: number) => void
  addTemplateSlot: (
    id: number,
    opts: {
      name: string
      side: LayerConfigFragmentSide
      render: LayerSlotRender
    },
  ) => () => void
}

function createLayerStoreScope(key: LayerStoreKey): Scope {
  const source = shallowRef<ComputedRef<LayerConfigFragment> | null>(null)
  // Pre-declare side keys so Vue 2 can track set/del (missing keys collect no deps).
  const template: LayerConfigFragment = reactive({
    container: undefined,
    content: undefined,
  })
  let _id: number | null = null
  let toRender: SlotToRender | null = null

  function clearTemplate() {
    set(template, 'container', undefined)
    set(template, 'content', undefined)
  }

  function is(id: number) {
    return _id === id
  }

  function getTemplateSlotsOrCreate(
    side: LayerConfigFragmentSide,
  ): Record<string, LayerSlotRender> {
    if (!template[side]) set(template, side, {})
    if (!template[side]!.slots) set(template[side]!, 'slots', {})
    return template[side]!.slots!
  }

  return {
    get fragment() {
      return source.value?.value ?? EMPTY
    },
    get template() {
      return template
    },
    begin(next) {
      // Callers must pass already-normalized fragments (toFragment* / normalizeAdapter).
      clearTemplate()
      const id = (_id = ++uid)
      const wrap: SlotToRender = (name, render) => {
        return (slotProps = {}) =>
          h(LayerSlotFragment, { key: `${id}:slot:${name}` }, () =>
            render(slotProps),
          )
      }
      toRender = wrap
      // Capture generation at begin; re-wrap when source slots change reactively.
      source.value = computed(() => wrapFragmentSlots(next.value, wrap))
      return id
    },
    clear(id) {
      if (_id !== id) return
      source.value = null
      _id = null
      toRender = null
      clearTemplate()
    },
    addTemplateSlot(id, { name, side, render }) {
      if (!is(id) || !toRender) return noop

      const slots = getTemplateSlotsOrCreate(side)
      if (slots[name]) {
        warn(
          `Duplicate LayerTemplate name="${name}" in ${key}:template.${side}; latter wins`,
        )
      }
      const wrap = toRender
      const slotRender: LayerSlotRender = wrap(name, (slotProps) =>
        render(slotProps ?? {}),
      )
      set(slots, name, slotRender)
      return () => {
        if (!is(id)) return
        if (slots[name] !== slotRender) return
        del(slots, name)
      }
    },
  }
}

function wrapSideSlots(
  slots: Record<string, LayerSlotRender> | undefined,
  toRender: SlotToRender,
): Record<string, LayerSlotRender> | undefined {
  if (!slots) return slots
  const wrapped: Record<string, LayerSlotRender> = {}
  for (const [name, render] of Object.entries(slots)) {
    wrapped[name] = toRender(name, render)
  }
  return wrapped
}

/** Wrap container/content slots with the current setup generation key. */
function wrapFragmentSlots(
  fragment: LayerConfigFragment,
  toRender: SlotToRender,
): LayerConfigFragment {
  const containerSlots = fragment.container?.slots
  const contentSlots = fragment.content?.slots
  if (!containerSlots && !contentSlots) return fragment

  const next: LayerConfigFragment = { ...fragment }
  if (fragment.container) {
    next.container = {
      ...fragment.container,
      slots: wrapSideSlots(containerSlots, toRender),
    }
  }
  if (fragment.content) {
    next.content = {
      ...fragment.content,
      slots: wrapSideSlots(contentSlots, toRender),
    }
  }
  return next
}

export function createLayerStore<T extends Record<string, unknown>>(
  init: T,
): UnwrapNestedRefs<T> &
  LayerStoreMethods & {
    use: LayerConfigFragment
    'use:template': LayerConfigFragment
    define: LayerConfigFragment
    'define:template': LayerConfigFragment
  } {
  const scopes: Record<LayerStoreKey, Scope> = {
    use: createLayerStoreScope('use'),
    define: createLayerStoreScope('define'),
  }

  function setup(key: LayerStoreKey, source: ComputedRef<LayerConfigFragment>) {
    const scope = scopes[key]
    const id = scope.begin(source)

    // Module-level useLayer() has no setup context, so the pair stays until overwritten.
    if (hasSetupContext()) {
      onUnmounted(() => {
        scope.clear(id)
      })
    }

    const template: LayerStoreTemplate = (opts) =>
      scope.addTemplateSlot(id, opts)

    return { template }
  }

  const store = reactive({
    ...init,
    get use() {
      return scopes.use.fragment
    },
    get 'use:template'() {
      return scopes.use.template
    },
    get define() {
      return scopes.define.fragment
    },
    get 'define:template'() {
      return scopes.define.template
    },
    setup,
  })

  return store
}
