import type { LayerTemplateEntry, LayerConfigNode, SlotRenderFn } from '@/types/config'

export function materializeTemplates(
  templates: Record<string, LayerTemplateEntry>,
): Record<string, SlotRenderFn> {
  const slots: Record<string, SlotRenderFn> = {}
  for (const [name, entry] of Object.entries(templates)) {
    slots[name] = (slotProps) => entry.render(slotProps ?? {})
  }
  return slots
}

export function templateRegistryToNodeConfig(
  templates: Record<string, LayerTemplateEntry> | undefined,
): LayerConfigNode | undefined {
  if (!templates || Object.keys(templates).length === 0) return undefined
  return { slots: materializeTemplates(templates) }
}
