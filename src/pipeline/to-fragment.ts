import type {
  LayerConfigFragment,
  LayerConfigNode,
  LayerStaticConfig,
  LayerTemplateEntry,
} from '@/types/config'
import type { LayerInstanceConfig } from '@/types/payload'
import { materializeTemplates } from './materialize-templates'

export function pickNodeConfig(source: {
  component?: LayerConfigNode['component']
  props?: LayerConfigNode['props']
  slots?: LayerConfigNode['slots']
}): LayerConfigNode {
  const result: LayerConfigNode = {}
  if (source.component !== undefined) result.component = source.component
  if (source.props !== undefined) result.props = source.props
  if (source.slots !== undefined) result.slots = source.slots
  return result
}

export function toFragmentFromStatic(config: LayerStaticConfig = {}): LayerConfigFragment {
  const fragment: LayerConfigFragment = {}
  const container = pickNodeConfig(config)
  if (Object.keys(container).length > 0) fragment.container = container
  if (config.content) fragment.content = config.content
  if (config.hideOn) fragment.hideOn = config.hideOn
  return fragment
}

export function toFragmentFromInstance(config: LayerInstanceConfig = {}): LayerConfigFragment {
  const fragment: LayerConfigFragment = {}
  const content = pickNodeConfig(config)
  if (Object.keys(content).length > 0) fragment.content = content
  if (config.container) fragment.container = config.container
  if (config.hideOn) fragment.hideOn = config.hideOn
  return fragment
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

export const EMPTY_LAYER_FRAGMENT: LayerConfigFragment = Object.freeze({})
