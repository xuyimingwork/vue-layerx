import { getCurrentInstance, inject } from 'vue'
import type { DefineLayerOptions } from '@/core/types'
import { hasDirectLayerMarker } from '@/vue/context/layer-marker'
import { LAYER_DEFINE_KEY } from '@/vue/di/injection-keys'

export function defineLayer(options: DefineLayerOptions = {}): void {
  const registry = inject(LAYER_DEFINE_KEY, null)
  const instance = getCurrentInstance()
  if (!registry || !hasDirectLayerMarker(instance)) return
  registry.register(options)
}
