import { computed, toValue, type Component, type MaybeRefOrGetter } from 'vue'
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
  config: MaybeRefOrGetter<LayerConfigCreate> = {},
) {
  const create = computed((): LayerCreateBucket => {
    const { adapter, ...staticConfig } = toValue(config)
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
    useConfig: MaybeRefOrGetter<LayerConfigInstance> = {},
  ): LayerInstance {
    const use = computed(() =>
      mergeFragment(
        toFragmentFromInstance(toValue(useConfig)),
        Content ? { content: { component: Content } } : undefined,
      ),
    )
    return createLayerInstance({ create, use })
  }
}
