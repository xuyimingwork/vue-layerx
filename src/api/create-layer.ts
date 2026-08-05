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

/**
 * Bind a container component (Dialog / Drawer / …) into a reusable `useLayer` factory.
 *
 * Top-level fields in `config` describe the **container**; optional `content` / `adapter`
 * apply as create-tier defaults. `config` may be plain, ref, getter, or computed.
 *
 * @example
 * ```ts
 * export const useDialog = createLayer(ElDialog, {
 *   props: { width: '480px', appendToBody: true },
 * })
 *
 * const dialog = useDialog(HelloWorld)
 * dialog.open()
 * // or content props sugar:
 * dialog.$open({ title: 'Hi' })
 * ```
 */
export function createLayer<Container extends AnyComponent>(
  Container: Container,
  config: MaybeRefOrGetter<LayerConfigCreateOf<PropsOf<Container>>> = {},
) {
  type ContainerProps = PropsOf<Container>

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
    useConfig?: MaybeRefOrGetter<LayerConfigContentOf<LooseProps, ContainerProps>>,
  ): LayerInstance<LooseProps, ContainerProps>
  function useLayer<CContent extends AnyComponent>(
    Content: CContent,
    useConfig?: MaybeRefOrGetter<
      LayerConfigContentOf<PropsOf<CContent>, ContainerProps>
    >,
  ): LayerInstance<PropsOf<CContent>, ContainerProps>
  function useLayer(
    Content?: AnyComponent,
    useConfig: MaybeRefOrGetter<LayerConfigContentOf<any, ContainerProps>> = {},
  ): LayerInstance<any, ContainerProps> {
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
      ContainerProps
    >
  }

  return useLayer
}
