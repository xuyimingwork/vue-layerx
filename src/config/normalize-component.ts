import { markRaw, type Component } from 'vue'
import type { LayerConfigFragment } from '@/types/config'

function normalizeComponent(component: Component): Component {
  return markRaw(component)
}

export function normalizeFragmentComponent(
  fragment: LayerConfigFragment,
): LayerConfigFragment {
  if (fragment.container?.component !== undefined) {
    fragment.container.component = normalizeComponent(fragment.container.component)
  }
  if (fragment.content?.component !== undefined) {
    fragment.content.component = normalizeComponent(fragment.content.component)
  }
  return fragment
}
