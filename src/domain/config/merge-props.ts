import type { LayerProps } from '@/domain/types/layer'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  return Object.assign({}, ...sources.filter(Boolean))
}
