import type { LayerMerged, LayerNormalized } from '@/types/config'
import { DEFAULT_CONTAINER_MODEL, bindContainerModel } from './container-model'
import { bindCloseOn } from './bind-close-on'

export interface BindLayerTreeContext {
  merged: LayerMerged
  visible: boolean
  close: () => void
}

export function bindLayerTree(ctx: BindLayerTreeContext): LayerNormalized {
  const { merged, visible, close } = ctx

  const contentComponent = merged.content.component
  const model = merged.container.model ?? DEFAULT_CONTAINER_MODEL

  const containerNormalized = {
    component: merged.container.component!,
    props: bindContainerModel(
      merged.container.props ?? {},
      visible,
      model,
      close,
    ),
    slots: merged.container.slots ?? {},
  }

  if (!contentComponent) {
    return { container: containerNormalized }
  }

  const contentProps = bindCloseOn(merged.content.props ?? {}, merged.content.closeOn, close)

  return {
    container: containerNormalized,
    content: {
      component: contentComponent,
      props: contentProps,
      slots: merged.content.slots ?? {},
    },
  }
}
