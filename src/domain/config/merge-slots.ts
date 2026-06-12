import type { LayerSlots } from '../types/layer'

export function mergeSlots(...sources: (LayerSlots | undefined)[]): LayerSlots {
  return Object.assign({}, ...sources.filter(Boolean))
}
