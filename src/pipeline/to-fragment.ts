import type {
  LayerConfigFragment,
  LayerConfigInstance,
  LayerConfigStatic,
  LayerTemplateEntry,
} from '@/types/config'
import { createLayerFragment } from '@/instance/layer-fragment'
import { mergeFragment } from './merge-node-config'
import { materializeTemplates } from './materialize-templates'

export function toFragmentFromStatic(config: LayerConfigStatic = {}): LayerConfigFragment {
  const { content, ...container } = config
  return mergeFragment(
    Object.keys(container).length > 0 ? { container } : undefined,
    content ? { content } : undefined,
  )
}

export function toFragmentFromInstance(config: LayerConfigInstance = {}): LayerConfigFragment {
  const { container, ...content } = config
  return mergeFragment(
    Object.keys(content).length > 0 ? { content } : undefined,
    container ? { container } : undefined,
  )
}

export function toTemplateFragment(
  templates: Record<string, LayerTemplateEntry>,
  side: 'container' | 'content',
): LayerConfigFragment | undefined {
  if (Object.keys(templates).length === 0) return undefined
  const slots = materializeTemplates(templates)
  return side === 'container'
    ? { container: { slots } }
    : { content: { slots } }
}

/** @deprecated use createLayerFragment() */
export const EMPTY_LAYER_FRAGMENT: LayerConfigFragment = createLayerFragment()
