import { getCurrentInstance, inject } from 'vue'
import type { LayerStaticConfig } from '@/types'
import { toFragmentFromStatic } from '@/pipeline/to-fragment'
import { hasDirectLayerMarker } from '@/context/layer-marker'
import { LAYER_DEFINE_KEY } from '@/di/injection-keys'

export function defineLayer(config: LayerStaticConfig = {}): void {
  const registry = inject(LAYER_DEFINE_KEY, null)
  const instance = getCurrentInstance()
  if (!registry || !hasDirectLayerMarker(instance)) return
  registry.register(toFragmentFromStatic(config))
}
