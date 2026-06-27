import type {
  LayerConfigFragment,
  LayerConfigInstance,
  LayerConfigStatic,
} from '@/types/config'
import { mergeFragment } from './merge-node-config'

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
