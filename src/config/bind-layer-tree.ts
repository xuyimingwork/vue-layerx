import type { LayerConfigFragment, LayerNormalized } from '@/types/config'
import { DEFAULT_CONTAINER_MODEL, bindContainerModel } from './container-model'
import { bindCloseOn } from './bind-close-on'

export interface BindLayerTreeContext {
  fragment: LayerConfigFragment
  visible: boolean
  close: () => void
}

export function bindLayerTree(ctx: BindLayerTreeContext): LayerNormalized {
  const { fragment, visible, close } = ctx
  const container = fragment.container ?? {}
  const content = fragment.content ?? {}

  const contentComponent = content.component
  const model = container.model ?? DEFAULT_CONTAINER_MODEL

  const containerNormalized = {
    component: container.component!,
    props: bindContainerModel(
      container.props ?? {},
      visible,
      model,
      close,
    ),
    slots: container.slots ?? {},
  }

  if (!contentComponent) {
    return { container: containerNormalized }
  }

  const contentProps = bindCloseOn(content.props ?? {}, content.closeOn, close)

  return {
    container: containerNormalized,
    content: {
      component: contentComponent,
      props: contentProps,
      slots: content.slots ?? {},
    },
  }
}
