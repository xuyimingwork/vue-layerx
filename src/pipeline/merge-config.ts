import type { LayerConfigFragment, LayerMerged, LayerConfigNode } from '@/types/config'
import type { LayerStateWithRegistry } from '@/instance/layer-state'
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
function mergeContainerSlots(state: LayerStateWithRegistry): LayerConfigNode['slots'] {
  return mergeNodeConfig(
    pickSlotsFragment(state.create, 'container'),
    pickSlotsFragment(state.templates.creatorContainer, 'container'),
    pickSlotsFragment(state.define, 'container'),
    pickSlotsFragment(state.templates.callerContainer, 'container'),
    pickSlotsFragment(state.use, 'container'),
    pickSlotsFragment(state.clone, 'container'),
    pickSlotsFragment(state.show, 'container'),
  ).slots
}

/**
 * Content slot priority (low → high, later wins):
 * create > caller template > use > clone > show
 */
function mergeContentSlots(state: LayerStateWithRegistry): LayerConfigNode['slots'] {
  return mergeNodeConfig(
    pickSlotsFragment(state.create, 'content'),
    pickSlotsFragment(state.templates.callerContent, 'content'),
    pickSlotsFragment(state.use, 'content'),
    pickSlotsFragment(state.clone, 'content'),
    pickSlotsFragment(state.show, 'content'),
  ).slots
}

export function mergeLayerState(state: LayerStateWithRegistry): LayerMerged {
  const contentBase = mergeNodeConfig(
    state.create.content,
    state.use.content,
    state.clone.content,
    state.show.content,
  )

  const containerBase = mergeNodeConfig(
    state.create.container,
    state.define?.container,
    state.use.container,
    state.clone.container,
    state.show.container,
  )

  const hideOn =
    state.show.hideOn ??
    state.clone.hideOn ??
    state.use.hideOn ??
    state.define?.hideOn

  return {
    content: { ...contentBase, slots: mergeContentSlots(state) },
    container: { ...containerBase, slots: mergeContainerSlots(state) },
    hideOn,
  }
}
