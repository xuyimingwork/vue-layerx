import type { Component } from 'vue'
import type { LayerMerged, LayerNormalized } from '@/types/config'
import { bindCloseOn } from './bind-close-on'

export interface ResolveContext {
  merged: LayerMerged
  Container: Component
  boundContent?: Component
  close: () => void
}

export function defaultResolve(ctx: ResolveContext): LayerNormalized {
  const { merged, Container, boundContent, close } = ctx

  const contentComponent = merged.content.component ?? boundContent

  const containerNormalized = {
    component: merged.container.component ?? Container,
    props: merged.container.props ?? {},
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
