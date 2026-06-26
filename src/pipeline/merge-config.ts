import type {
  LayerConfigFragment,
  LayerConfigNodeContainer,
  LayerConfigNodeContent,
  LayerMerged,
} from '@/types/config'
import type { LayerInstanceStoreWithRegistry } from '@/instance/layer-instance-store'
import { mergeContainerNode, mergeContentNode, mergeFragment } from './merge-node-config'

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
function mergeContainerSlots(
  store: LayerInstanceStoreWithRegistry,
  define: LayerConfigFragment | null,
  creatorContainer: LayerConfigFragment | null,
): LayerConfigNodeContainer['slots'] {
  return mergeContainerNode(
    pickSlotsFragment(store.create, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(creatorContainer, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(define, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.callerContainer, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.use, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.clone, 'container') as LayerConfigNodeContainer | undefined,
    pickSlotsFragment(store.open, 'container') as LayerConfigNodeContainer | undefined,
  ).slots
}

/**
 * Content slot priority (low → high, later wins):
 * create > caller template > define > use > clone > open
 */
function mergeContentSlots(
  store: LayerInstanceStoreWithRegistry,
  define: LayerConfigFragment | null,
): LayerConfigNodeContent['slots'] {
  return mergeContentNode(
    pickSlotsFragment(store.create, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.callerContent, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(define, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.use, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.clone, 'content') as LayerConfigNodeContent | undefined,
    pickSlotsFragment(store.open, 'content') as LayerConfigNodeContent | undefined,
  ).slots
}

export function mergeLayerConfigStore(
  store: LayerInstanceStoreWithRegistry,
  define: LayerConfigFragment | null = null,
  creatorContainer: LayerConfigFragment | null = null,
): LayerMerged {
  const base = mergeFragment(
    store.create,
    define,
    store.use,
    store.clone,
    store.open,
  )

  return {
    content: { ...(base.content ?? {}), slots: mergeContentSlots(store, define) },
    container: { ...(base.container ?? {}), slots: mergeContainerSlots(store, define, creatorContainer) },
  }
}

export { mergeFragment } from './merge-node-config'
