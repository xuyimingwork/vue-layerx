import { reactive, type UnwrapNestedRefs } from 'vue'
import type { LayerTemplateEntry } from '@/types/config'
import { createLayerFragment, type LayerFragment } from '@/instance/layer-fragment'

export type TemplateSlotKey =
  | 'use:template.container'
  | 'use:template.content'
  | 'define:template.container'

export interface LayerInstanceStore {
  create: LayerFragment
  use: LayerFragment
  open: LayerFragment
  'use:template': LayerFragment
}

export interface LayerViewStore {
  define: LayerFragment
  'define:template': LayerFragment
}

export interface LayerInstanceStoreInit {
  create: LayerFragment
  use?: LayerFragment
}

type LayerStoreMethods = {
  template: (opts: {
    key: TemplateSlotKey
    name: string
    entry: LayerTemplateEntry
  }) => void
  track: () => void
}

export type LayerInstanceStoreWithTemplate = UnwrapNestedRefs<LayerInstanceStore> &
  LayerStoreMethods

export type LayerViewStoreWithTemplate = UnwrapNestedRefs<LayerViewStore> &
  LayerStoreMethods

function warnDuplicate(name: string, scope: string) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(
    `[vue-layerx] Duplicate LayerTemplate name="${name}" in ${scope}; latter wins`,
  )
}

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
  bucket: LayerFragment,
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

function trackFragmentBuckets(
  store: Record<string, LayerFragment>,
  bucketKeys: string[],
): void {
  for (const key of bucketKeys) {
    const fragment = store[key]
    if (!fragment) continue
    void fragment.content
    void fragment.container
    void fragment.content?.slots
    void fragment.container?.slots
    if (fragment.content?.slots) {
      for (const slotName of Object.keys(fragment.content.slots)) {
        void fragment.content.slots[slotName]
      }
    }
    if (fragment.container?.slots) {
      for (const slotName of Object.keys(fragment.container.slots)) {
        void fragment.container.slots[slotName]
      }
    }
  }
}

function createLayerStore<T extends Record<string, LayerFragment>>(
  init: T,
): UnwrapNestedRefs<T> & LayerStoreMethods {
  const bucketKeys = Object.keys(init)
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
    const fragment = (store as Record<string, LayerFragment>)[bucket]
    if (!fragment) return
    const slots = ensureSlots(fragment, side)
    if (slots[name]) warnDuplicate(name, key)
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }

  const track = () => {
    trackFragmentBuckets(store as Record<string, LayerFragment>, bucketKeys)
  }

  return Object.assign(store, { template, track }) as UnwrapNestedRefs<T> &
    LayerStoreMethods
}

export function createLayerInstanceStore(
  init: LayerInstanceStoreInit,
): LayerInstanceStoreWithTemplate {
  return createLayerStore({
    create: createLayerFragment(init.create),
    use: createLayerFragment(init.use),
    open: createLayerFragment(),
    'use:template': createLayerFragment(),
  })
}

export function createLayerViewStore(): LayerViewStoreWithTemplate {
  return createLayerStore({
    define: createLayerFragment(),
    'define:template': createLayerFragment(),
  })
}
