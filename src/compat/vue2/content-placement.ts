import { computed, type ComputedRef, type Ref, type WritableComputedRef } from 'vue'
import type { LayerBound } from '@/types'

/**
 * Vue 2.7: no Teleport / parking — no-op placement ref.
 * Signature matches Vue 3 so `LayerView` can call one compat export.
 */
export function useContentPlacement(
  _bound: Ref<LayerBound>,
  _visible: ComputedRef<boolean>,
): WritableComputedRef<HTMLUnknownElement | undefined> {
  return computed({
    get: () => undefined,
    set: () => {},
  })
}
