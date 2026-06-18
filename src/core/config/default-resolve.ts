import type { Component } from 'vue'
import type { LayerMerged, LayerNormalized } from '@/core/types/config'
import { bindHideOn } from './bind-hide-on'

export interface ResolveContext {
  merged: LayerMerged
  LayerComponent: Component
  boundContent?: Component
  hide: () => void
}

export function defaultResolve(ctx: ResolveContext): LayerNormalized {
  const { merged, LayerComponent, boundContent, hide } = ctx

  const contentComponent = merged.content.component ?? boundContent

  const containerNormalized = {
    component: merged.container.component ?? LayerComponent,
    props: merged.container.props ?? {},
    slots: merged.container.slots ?? {},
  }

  if (!contentComponent) {
    return {
      container: containerNormalized,
      content: {
        component: LayerComponent,
        props: {},
        slots: {},
      },
    }
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

export function hasContentComponent(ctx: ResolveContext): boolean {
  return !!(ctx.merged.content.component ?? ctx.boundContent)
}
