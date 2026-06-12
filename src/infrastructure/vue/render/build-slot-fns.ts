import type { VNode } from 'vue'
import type { LayerSlots } from '../../../domain/types'

export function buildSlotFns(
  slots: LayerSlots,
  slotsVersion: number,
): Record<string, () => VNode | VNode[] | null> {
  const slotFns: Record<string, () => VNode | VNode[] | null> = {}
  for (const [name, slotRef] of Object.entries(slots)) {
    slotFns[name] = () => {
      void slotsVersion
      return slotRef?.value?.render() ?? null
    }
  }
  return slotFns
}
