import type { Component } from 'vue'
import type { LayerConfigCreate, LayerConfigInstance, LayerInstance } from '@/types'
import { DEFAULT_CONTAINER_MODEL } from '@/types/config'
import {
  mergeFragment,
  toFragmentFromInstance,
  toFragmentFromStatic,
} from '@/config/fragment'
import { createLayerInstance } from '@/runtime/layer-instance'

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

  return function useLayer(
    Content?: Component,
    useConfig: LayerConfigInstance = {},
  ): LayerInstance {
    const use = mergeFragment(
      toFragmentFromInstance(useConfig),
      Content ? { content: { component: Content } } : undefined,
    )
    const instance = createLayerInstance({ create, adapter, use })
    instance.bindHost()
    return instance
  }
}
