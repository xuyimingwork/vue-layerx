import type { Component } from 'vue'
import { resolveShellConfig } from './shell-config'
import { createUseLayer } from './use-layer'
import type { LayerShellOptions } from './types'

export function createLayerx(
  container: Component,
  shellDefaults: LayerShellOptions = {},
) {
  return createUseLayer({
    Shell: container,
    ...resolveShellConfig(shellDefaults),
  })
}
