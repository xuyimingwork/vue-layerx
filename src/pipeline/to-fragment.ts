import type {
  LayerConfigFragment,
  LayerConfigNodeContainer,
  LayerConfigNodeContent,
  LayerConfigStatic,
  LayerTemplateEntry,
} from '@/types/config'
import type { LayerConfigInstance } from '@/types/config'
import { materializeTemplates } from './materialize-templates'

export function pickContainerNode(source: LayerConfigNodeContainer): LayerConfigNodeContainer {
  const result: LayerConfigNodeContainer = {}
  if (source.component !== undefined) result.component = source.component
  if (source.props !== undefined) result.props = source.props
  if (source.slots !== undefined) result.slots = source.slots
  if (source.model !== undefined) result.model = source.model
  return result
}

export function pickContentNode(source: LayerConfigNodeContent): LayerConfigNodeContent {
  const result: LayerConfigNodeContent = {}
  if (source.component !== undefined) result.component = source.component
  if (source.props !== undefined) result.props = source.props
  if (source.slots !== undefined) result.slots = source.slots
  if (source.closeOn !== undefined) result.closeOn = source.closeOn
  return result
}

export function toFragmentFromStatic(config: LayerConfigStatic = {}): LayerConfigFragment {
  const fragment: LayerConfigFragment = {}
  const container = pickContainerNode(config)
  if (Object.keys(container).length > 0) fragment.container = container
  if (config.content) fragment.content = pickContentNode(config.content)
  return fragment
}

export function toFragmentFromInstance(config: LayerConfigInstance = {}): LayerConfigFragment {
  const fragment: LayerConfigFragment = {}
  const content = pickContentNode(config)
  if (Object.keys(content).length > 0) fragment.content = content
  if (config.container) fragment.container = pickContainerNode(config.container)
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
