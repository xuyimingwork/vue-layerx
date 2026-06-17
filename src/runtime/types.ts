import type { Component } from 'vue'
import type { LayerAdapt, LayerDefaults } from '@/core/types'

export interface UseLayerContext {
  LayerComponent: Component
  layerDefaults: LayerDefaults
  visibleProp: string
  visibleEvent: string
  adapt?: LayerAdapt
}
