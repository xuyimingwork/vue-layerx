import type { Component } from 'vue'
import { resolveLayerConfig } from './layer-config'
import { createUseLayer } from './use-layer'
import type { CreateLayerxOptions } from './types'

export function createLayerx(
  Layer: Component,
  options: CreateLayerxOptions = {},
) {
  const resolved = resolveLayerConfig(options)
  return createUseLayer({ Layer, ...resolved })
}
