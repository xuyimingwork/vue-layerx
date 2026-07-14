import { computed, type Component } from 'vue'
import type {
  LayerConfigCreate,
  LayerConfigInstance,
  LayerCreateBucket,
  LayerInstance,
} from '@/types'
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
  const create = computed((): LayerCreateBucket => {
    const { adapter, ...staticConfig } = config
    return {
      ...mergeFragment(
        toFragmentFromStatic(staticConfig),
        { container: { component: Container } },
      ),
      ...(adapter !== undefined ? { adapter } : {}),
    }
  })

  return function useLayer(
    Content?: Component,
    useConfig: LayerConfigInstance = {},
  ): LayerInstance {
    const use = computed(() =>
      mergeFragment(
        toFragmentFromInstance(useConfig),
        Content ? { content: { component: Content } } : undefined,
      ),
    )
    return createLayerInstance({ create, use })
  }
}
