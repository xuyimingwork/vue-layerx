import type { Component } from 'vue'
import type { LayerAdapt, LayerFactoryDefaults } from '@/core/types'

export interface UseLayerFactoryContext {
  factoryLayer: Component
  factoryDefaults: LayerFactoryDefaults
  visibleProp: string
  visibleEvent: string
  adapt?: LayerAdapt
}
