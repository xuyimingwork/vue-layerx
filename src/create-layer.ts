import type { Component } from 'vue'
import type { LayerConfigCreate } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import { mergeFragment } from '@/pipeline/merge-node-config'
import { toFragmentFromStatic } from '@/pipeline/to-fragment'
import { createUseLayer } from '@/instance/create-use-layer'

export function createLayer(
  Container: Component,
  config: LayerConfigCreate = {},
) {
  const { adapter, ...staticConfig } = config

  const create = mergeFragment(
    { container: { model: DEFAULT_CONTAINER_MODEL } },
    toFragmentFromStatic(staticConfig),
    { container: { component: Container } },
  )

  return createUseLayer({ create, adapter })
}
