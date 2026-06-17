import type { ComponentInternalInstance } from 'vue'
import { LAYERX_DIRECT_CONTENT } from '@/domain/constants/markers'

export function hasDirectLayerMarker(
  instance: ComponentInternalInstance | null | undefined,
): boolean {
  if (!instance) return false
  if (instance.props?.[LAYERX_DIRECT_CONTENT] === true) return true

  const attrs = instance.attrs as Record<string, unknown> | undefined
  if (attrs?.[LAYERX_DIRECT_CONTENT] === true) return true

  const vnodeProps = instance.vnode?.props as Record<string, unknown> | null
  if (vnodeProps?.[LAYERX_DIRECT_CONTENT] === true) return true

  return false
}
