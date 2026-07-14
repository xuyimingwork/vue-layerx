import { computed, toValue, type Component, type MaybeRefOrGetter } from 'vue'
import type {
  LayerConfigCreate,
  LayerConfigContent,
  LayerConfigFragmentCreate,
  LayerInstance,
} from '@/types'
import {
  mergeFragment,
  toFragmentFromContent,
  toFragmentFromContainer,
} from '@/config/fragment'
import { createLayerInstance } from '@/runtime/layer-instance'

export function createLayer(
  Container: Component,
  config: MaybeRefOrGetter<LayerConfigCreate> = {},
) {
  const create = computed((): LayerConfigFragmentCreate => {
    const { adapter, ...containerConfig } = toValue(config)
    return {
      ...mergeFragment(
        toFragmentFromContainer(containerConfig),
        { container: { component: Container } },
      ),
      ...(adapter !== undefined ? { adapter } : {}),
    }
  })

  return function useLayer(
    Content?: Component,
    useConfig: MaybeRefOrGetter<LayerConfigContent> = {},
  ): LayerInstance {
    const use = computed(() =>
      mergeFragment(
        toFragmentFromContent(toValue(useConfig)),
        Content ? { content: { component: Content } } : undefined,
      ),
    )
    return createLayerInstance({ create, use })
  }
}
