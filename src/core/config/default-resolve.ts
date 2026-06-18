import type { Component } from 'vue'
import type {
  LayerMerged,
  LayerNormalized,
  LayerTemplateEntry,
  SlotRenderFn,
} from '@/core/types/config'
import { bindHideOn } from './bind-hide-on'

export interface ResolveContext {
  merged: LayerMerged
  LayerComponent: Component
  boundContent?: Component
  containerTemplates: Record<string, LayerTemplateEntry>
  contentTemplates: Record<string, LayerTemplateEntry>
  hide: () => void
}

function materializeTemplates(
  templates: Record<string, LayerTemplateEntry>,
): Record<string, SlotRenderFn> {
  const slots: Record<string, SlotRenderFn> = {}
  for (const [name, entry] of Object.entries(templates)) {
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }
  return slots
}

function resolveNodeSlots(
  templates: Record<string, LayerTemplateEntry>,
  mergedSlots: LayerMerged['container']['slots'],
): Record<string, SlotRenderFn> {
  return {
    ...materializeTemplates(templates),
    ...mergedSlots,
  }
}

export function defaultResolve(ctx: ResolveContext): LayerNormalized {
  const { merged, LayerComponent, boundContent, containerTemplates, contentTemplates, hide } =
    ctx

  const contentComponent = merged.content.component ?? boundContent

  const containerNormalized = {
    component: merged.container.component ?? LayerComponent,
    props: merged.container.props ?? {},
    slots: resolveNodeSlots(containerTemplates, merged.container.slots),
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
      slots: resolveNodeSlots(contentTemplates, merged.content.slots),
    },
  }
}

export function hasContentComponent(ctx: ResolveContext): boolean {
  return !!(ctx.merged.content.component ?? ctx.boundContent)
}
