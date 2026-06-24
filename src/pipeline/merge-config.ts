import type {
  LayerConfigFragment,
  LayerConfigNodeContainer,
  LayerConfigNodeContent,
  LayerMerged,
} from '@/types/config'
import type { LayerConfigStoreWithRegistry } from '@/instance/layer-config-store'
import { mergeContainerNode, mergeContentNode } from './merge-node-config'

function pickSlotsFragment(
  fragment: LayerConfigFragment | null | undefined,
  side: 'content' | 'container',
): LayerConfigNodeContent | LayerConfigNodeContainer | undefined {
  if (!fragment) return undefined
  const node = side === 'content' ? fragment.content : fragment.container
  if (!node?.slots) return undefined
  return { slots: node.slots }
}

/**
 * Container slot priority (low → high, later wins):
 * create > creator template > define > caller template > use > clone > open
 */
function mergeContainerSlots(store: LayerConfigStoreWithRegistry): LayerConfigNodeContainer['slots'] {
  return mergeContainerNode(
    pickSlotsFragment(store.create, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.templates.creatorContainer, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.define, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.templates.callerContainer, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.use, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.clone, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.open, 'container') as LayerConfigNodeContainer | undefined,
  ).slots
}

/**
 * Content slot priority (low → high, later wins):
 * create > caller template > define > use > clone > open
 */
function mergeContentSlots(store: LayerConfigStoreWithRegistry): LayerConfigNodeContent['slots'] {
  return mergeContentNode(
    pickSlotsFragment(store.create, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.templates.callerContent, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.define, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.use, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.clone, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.open, 'content') as LayerConfigNodeContent | undefined,
  ).slots
}

export function mergeLayerConfigStore(store: LayerConfigStoreWithRegistry): LayerMerged {
  const contentBase = mergeContentNode(
    store.create.content,
    store.define?.content,
    store.use.content,
    store.clone.content,
    store.open.content,
  )

  const containerBase = mergeContainerNode(
    store.create.container,
    store.define?.container,
    store.use.container,
    store.clone.container,
    store.open.container,
  )

  return {
    content: { ...contentBase, slots: mergeContentSlots(store) },
    container: { ...containerBase, slots: mergeContainerSlots(store) },
  }
}
