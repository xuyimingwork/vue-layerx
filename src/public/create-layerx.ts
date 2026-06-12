import type { Component } from 'vue'
import { createUseLayer } from '../application/factory/create-use-layer'
import { resolveLayerConfig } from '../application/factory/resolve-layer-config'
import type { CreateLayerxOptions } from '../domain/types'

export function createLayerx(
  Layer: Component,
  options: CreateLayerxOptions = {},
) {
  const resolved = resolveLayerConfig(options)
  return createUseLayer({ Layer, ...resolved })
}
