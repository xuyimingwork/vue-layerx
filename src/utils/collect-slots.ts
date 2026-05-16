import type { SlotRenderFn } from '../types'

export function collectSlots(
  slotFns: Record<string, SlotRenderFn | undefined>,
) {
  const innerSlots: Record<string, SlotRenderFn> = {}
  for (const [name, fn] of Object.entries(slotFns)) {
    if (fn) innerSlots[name] = fn
  }
  return Object.keys(innerSlots).length ? innerSlots : undefined
}
