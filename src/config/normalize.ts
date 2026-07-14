import { ComponentPublicInstance, isRef, markRaw, type Component } from 'vue'
import type { LayerConfigContainer, LayerConfigContent, LayerConfigFragment } from '@/types/config'

function normalizeComponent(component: Component): Component {
  return markRaw(component)
}

type RefCallback = (el: ComponentPublicInstance | null) => void
function normalizeRef(ref: any): any {
  if (isRef(ref)) return ((el) => { ref.value = el }) as RefCallback
  return ref
}

function normalizeFragmentNode(node?: LayerConfigContainer | LayerConfigContent) {
  if (node?.component !== undefined) node.component = normalizeComponent(node.component)
  if (node?.props?.ref !== undefined) node.props.ref = normalizeRef(node.props.ref)
}

export function normalizeFragment(
  fragment: LayerConfigFragment,
): LayerConfigFragment {
  normalizeFragmentNode(fragment.container)
  normalizeFragmentNode(fragment.content)
  return fragment
}
