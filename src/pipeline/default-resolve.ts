import type { Component } from 'vue'
import type { LayerMerged, LayerNormalized } from '@/types/config'
import { bindHideOn } from './bind-hide-on'

export interface ResolveContext {
  merged: LayerMerged
  Container: Component
  boundContent?: Component
  hide: () => void
}

export function defaultResolve(ctx: ResolveContext): LayerNormalized {
  const { merged, Container, boundContent, hide } = ctx

  const contentComponent = merged.content.component ?? boundContent

  const containerNormalized = {
    component: merged.container.component ?? Container,
    props: merged.container.props ?? {},
    slots: merged.container.slots ?? {},
  }

  if (!contentComponent) {
    return { container: containerNormalized }
  }

  const contentProps = bindHideOn(merged.content.props ?? {}, merged.hideOn, hide)

  return {
    container: containerNormalized,
    content: {
      component: contentComponent,
      props: contentProps,
      slots: merged.content.slots ?? {},
    },
  }
}
