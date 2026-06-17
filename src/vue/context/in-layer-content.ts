import type { ComponentInternalInstance } from 'vue'
import { hasDirectLayerMarker } from './layer-marker'
import { getOwningContentInstance } from './owning-content'

export function isInDirectLayerContent(
  instance: ComponentInternalInstance | null | undefined,
): boolean {
  return hasDirectLayerMarker(getOwningContentInstance(instance))
}
