import type { Component } from 'vue'
import { resolveShellConfig } from './shell-config'
import { createUseLayer } from './use-layer'
import type { LayerShellOptions } from './types'

export function createLayerx(Shell: Component, options: LayerShellOptions = {}) {
  const resolved = resolveShellConfig(options)
  return createUseLayer({ Shell, ...resolved })
}
