import type { ComponentInternalInstance } from 'vue'

/** Set by renderLayerTree on the content root vnode only. */
export const LAYERX_LAYER_CONTENT = Symbol('vue-layerx:layer-content')

export function isLayerContent(
  instance: ComponentInternalInstance | null | undefined,
): boolean {
  if (!instance) return false
  if (instance.props?.[LAYERX_LAYER_CONTENT] === true) return true
  if ((instance.attrs as Record<PropertyKey, unknown> | undefined)?.[LAYERX_LAYER_CONTENT] === true) {
    return true
  }
  // Symbol prop keys from h() are readable on vnode.props in Vue runtime
  const vnodeProps = instance.vnode?.props as Record<PropertyKey, unknown> | null | undefined
  return vnodeProps?.[LAYERX_LAYER_CONTENT] === true
}
