import { computed, type Component } from 'vue'
import type {
  AnyComponent,
  LayerConfigCreateOf,
  LayerConfigContentOf,
  LayerConfigFragmentCreate,
  LayerInstance,
  LooseProps,
  PropsOf,
} from '@/types'
import {
  mergeFragment,
  toFragmentFromContent,
  toFragmentFromContainer,
} from '@/config/fragment'
import { createLayerInstance } from '@/runtime/layer-instance'
import { toValue, type MaybeRefOrGetter } from '@/compat'

export function createLayer<CContainer extends AnyComponent>(
  Container: CContainer,
  config: MaybeRefOrGetter<LayerConfigCreateOf<PropsOf<CContainer>>> = {},
) {
  type ContainerP = PropsOf<CContainer>

  const create = computed((): LayerConfigFragmentCreate => {
    const { adapter, ...containerConfig } = toValue(config)
    return {
      ...mergeFragment(
        toFragmentFromContainer(containerConfig),
        { container: { component: Container as Component } },
      ),
      ...(adapter !== undefined ? { adapter } : {}),
    }
  })

  function useLayer(
    Content?: undefined,
    useConfig?: MaybeRefOrGetter<LayerConfigContentOf<LooseProps, ContainerP>>,
  ): LayerInstance<LooseProps, ContainerP>
  function useLayer<CContent extends AnyComponent>(
    Content: CContent,
    useConfig?: MaybeRefOrGetter<
      LayerConfigContentOf<PropsOf<CContent>, ContainerP>
    >,
  ): LayerInstance<PropsOf<CContent>, ContainerP>
  function useLayer(
    Content?: AnyComponent,
    useConfig: MaybeRefOrGetter<LayerConfigContentOf<any, ContainerP>> = {},
  ): LayerInstance<any, ContainerP> {
    const use = computed(() =>
      mergeFragment(
        toFragmentFromContent(toValue(useConfig)),
        Content
          ? { content: { component: Content as Component } }
          : undefined,
      ),
    )
    return createLayerInstance({ create, use }) as LayerInstance<
      any,
      ContainerP
    >
  }

  return useLayer
}
