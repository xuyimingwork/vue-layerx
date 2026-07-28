import {
  computed,
  onBeforeUnmount,
  ref,
  toRaw,
  type Component,
  type ComputedRef,
  type Ref,
  type WritableComputedRef,
} from 'vue'
import type { LayerBound } from '@/types'
import { toValue } from '@/compat/polyfill/to-value'

function useParkingElement(): HTMLUnknownElement {
  const el = document.createElement('layer-content-parking')
  el.style.display = 'none'
  document.body.appendChild(el)
  onBeforeUnmount(() => el.remove())
  return el
}

/**
 * Anchor when present; otherwise hidden parking so Teleport never uses disabled/in-place.
 * Vue 2.7 counterpart is a no-op (no Teleport) with the same signature.
 */
export function useContentPlacement(
  bound: Ref<LayerBound>,
  visible: ComputedRef<boolean>,
): WritableComputedRef<HTMLUnknownElement | undefined> {
  const anchor = ref<HTMLUnknownElement | null>(null)
  const parking = useParkingElement()
  const container = computed(() => toValue(bound).container?.component)
  const active = ref<Component | null>(null)

  return computed({
    get: () => {
      if (!active.value) return
      return anchor.value ?? (visible.value ? parking : undefined)
    },
    set: (el) => {
      anchor.value = el as HTMLUnknownElement | null
      const same = toRaw(active.value) === toRaw(container.value)
      active.value = !el && same ? null : container.value
    },
  })
}
