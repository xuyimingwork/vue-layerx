import { getCurrentInstance, inject } from 'vue'
import type { LayerStaticConfig } from '@/core/types'
import { toFragmentFromStatic } from '@/core/config/to-fragment'
import { hasDirectLayerMarker } from '@/vue/context/layer-marker'
import { LAYER_DEFINE_KEY } from '@/vue/di/injection-keys'

export function defineLayer(config: LayerStaticConfig = {}): void {
  const registry = inject(LAYER_DEFINE_KEY, null)
  const instance = getCurrentInstance()
  if (!registry || !hasDirectLayerMarker(instance)) return
  registry.register(toFragmentFromStatic(config))
}
