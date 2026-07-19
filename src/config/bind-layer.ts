import type { LayerConfigFragment } from '@/types/config'
import type { LayerBound } from '@/types/bound'
import { DEFAULT_CONTAINER_MODEL, bindContainerModel } from './bind-container-model'
import { bindCloseOn } from './bind-close-on'

export function bindLayer(ctx: {
  fragment: LayerConfigFragment
  visible: boolean
  close: () => void
}): LayerBound {
  const { fragment, visible, close } = ctx
  const container = fragment.container ?? {}
  const content = fragment.content ?? {}

  const contentComponent = content.component
  const model = container.model ?? DEFAULT_CONTAINER_MODEL

  const containerBound = {
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
    return { container: containerBound }
  }

  const contentProps = bindCloseOn(content.props ?? {}, content.closeOn, close)

  return {
    container: containerBound,
    content: {
      component: contentComponent,
      props: contentProps,
      slots: content.slots ?? {},
    },
  }
}
