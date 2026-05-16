import type { LayerProps } from '../types'

export function mergeProps(...sources: (LayerProps | undefined)[]): LayerProps {
  return Object.assign({}, ...sources.filter(Boolean))
}
