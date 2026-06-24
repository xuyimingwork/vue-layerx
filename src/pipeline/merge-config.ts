import type { LayerConfigFragment, LayerMerged, LayerConfigNode } from '@/types/config'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { mergeNodeConfig } from './merge-node-config'

function pickSlotsFragment(
  fragment: LayerConfigFragment | null | undefined,
  side: 'content' | 'container',
): LayerConfigNode | undefined {
  if (!fragment) return undefined
  const node = side === 'content' ? fragment.content : fragment.container
  if (!node?.slots) return undefined
  return { slots: node.slots }
}

/**
 * Container slot priority (low → high, later wins):
 * create > creator template > define > caller template > use > clone > show
 */
function mergeContainerSlots(store: LayerConfigStoreWithRegistry): LayerConfigNode['slots'] {
  return mergeNodeConfig(
    pickSlotsFragment(store.create, 'container'),
    pickSlotsFragment(store.templates.creatorContainer, 'container'),
    pickSlotsFragment(store.define, 'container'),
    pickSlotsFragment(store.templates.callerContainer, 'container'),
    pickSlotsFragment(store.use, 'container'),
    pickSlotsFragment(store.clone, 'container'),
    pickSlotsFragment(store.show, 'container'),
  ).slots
}

/**
 * Content slot priority (low → high, later wins):
 * create > caller template > use > clone > show
 */
function mergeContentSlots(store: LayerConfigStoreWithRegistry): LayerConfigNode['slots'] {
  return mergeNodeConfig(
    pickSlotsFragment(store.create, 'content'),
    pickSlotsFragment(store.templates.callerContent, 'content'),
    pickSlotsFragment(store.use, 'content'),
    pickSlotsFragment(store.clone, 'content'),
    pickSlotsFragment(store.show, 'content'),
  ).slots
}

export function mergeLayerConfigStore(store: LayerConfigStoreWithRegistry): LayerMerged {
  const contentBase = mergeNodeConfig(
    store.create.content,
    store.use.content,
    store.clone.content,
    store.show.content,
  )

  const containerBase = mergeNodeConfig(
    store.create.container,
    store.define?.container,
    store.use.container,
    store.clone.container,
    store.show.container,
  )

  const hideOn =
    store.show.hideOn ??
    store.clone.hideOn ??
    store.use.hideOn ??
    store.define?.hideOn

  return {
    content: { ...contentBase, slots: mergeContentSlots(store) },
    container: { ...containerBase, slots: mergeContainerSlots(store) },
    hideOn,
  }
}
