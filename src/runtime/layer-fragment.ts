import type { LayerConfigFragment } from '@/types/config'

export type LayerFragment = LayerConfigFragment

export function createLayerFragment(init?: LayerConfigFragment): LayerFragment {
  return init ?? {}
}
