import type { Component } from 'vue'
import type {
  LayerMerged,
  LayerNormalized,
  LayerTemplateEntry,
} from '@/core/types/config'
import { bindHideOn } from './bind-hide-on'

export interface ResolveContext {
  merged: LayerMerged
  LayerComponent: Component
  boundContent?: Component
  layerTemplates: Record<string, LayerTemplateEntry>
  contentTemplates: Record<string, LayerTemplateEntry>
  hide: () => void
}

function materializeTemplates(
  templates: Record<string, LayerTemplateEntry>,
): Record<string, () => ReturnType<LayerTemplateEntry['render']>> {
  const slots: Record<string, () => ReturnType<LayerTemplateEntry['render']>> = {}
  for (const [name, entry] of Object.entries(templates)) {
    slots[name] = () => entry.render()
  }
  return slots
}

function resolveNodeSlots(
  templates: Record<string, LayerTemplateEntry>,
  mergedSlots: LayerMerged['layer']['slots'],
): Record<string, () => ReturnType<LayerTemplateEntry['render']>> {
  return {
    ...materializeTemplates(templates),
    ...mergedSlots,
  }
}

export function defaultResolve(ctx: ResolveContext): LayerNormalized {
  const { merged, LayerComponent, boundContent, layerTemplates, contentTemplates, hide } =
    ctx

  const contentComponent = merged.content.component ?? boundContent

  const layerNormalized = {
    component: merged.layer.component ?? LayerComponent,
    props: merged.layer.props ?? {},
    slots: resolveNodeSlots(layerTemplates, merged.layer.slots),
  }

  if (!contentComponent) {
    return {
      layer: layerNormalized,
      content: {
        component: LayerComponent,
        props: {},
        slots: {},
      },
    }
  }

  const contentProps = bindHideOn(merged.content.props ?? {}, merged.hideOn, hide)

  return {
    layer: layerNormalized,
    content: {
      component: contentComponent,
      props: contentProps,
      slots: resolveNodeSlots(contentTemplates, merged.content.slots),
    },
  }
}

export function hasContentComponent(ctx: ResolveContext): boolean {
  return !!(ctx.merged.content.component ?? ctx.boundContent)
}
