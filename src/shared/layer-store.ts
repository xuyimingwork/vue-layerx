import { reactive, type UnwrapNestedRefs } from 'vue'
import type { LayerStoreMethods, TemplateSlotKey } from '@/types/store'
import type { LayerConfigFragment, LayerTemplateEntry } from '@/types/config'
import { warn } from '@/shared/warn'

export type {
  TemplateSlotKey,
  LayerStoreMethods,
  LayerInstanceStore,
  LayerViewStore,
  LayerInstanceStoreInit,
  LayerInstanceStoreWithTemplate,
  LayerViewStoreWithTemplate,
} from '@/types/store'

function parseTemplateKey(key: TemplateSlotKey): {
  bucket: string
  side: 'container' | 'content'
} {
  const dot = key.lastIndexOf('.')
  return {
    bucket: key.slice(0, dot),
    side: key.slice(dot + 1) as 'container' | 'content',
  }
}

function ensureSlots(
  bucket: LayerConfigFragment,
  side: 'container' | 'content',
): Record<string, LayerTemplateEntry['render']> {
  if (side === 'container') {
    if (!bucket.container) bucket.container = {}
    if (!bucket.container.slots) bucket.container.slots = {}
    return bucket.container.slots
  }
  if (!bucket.content) bucket.content = {}
  if (!bucket.content.slots) bucket.content.slots = {}
  return bucket.content.slots
}

export function createLayerStore<T extends Record<string, unknown>>(
  init: T,
): UnwrapNestedRefs<T> & LayerStoreMethods {
  const store = reactive(init)

  const template = ({
    key,
    name,
    entry,
  }: {
    key: TemplateSlotKey
    name: string
    entry: LayerTemplateEntry
  }) => {
    const { bucket, side } = parseTemplateKey(key)
    const fragment = (store as Record<string, LayerConfigFragment>)[bucket]
    if (!fragment) return () => {}
    const slots = ensureSlots(fragment, side)
    if (slots[name]) {
      warn(
        `Duplicate LayerTemplate name="${name}" in ${key}; latter wins`,
      )
    }
    const render = (slotProps?: Record<string, unknown>) =>
      entry.render(slotProps ?? {})
    slots[name] = render
    return () => {
      if (slots[name] === render) delete slots[name]
    }
  }

  return Object.assign(store, { template }) as UnwrapNestedRefs<T> &
    LayerStoreMethods
}
