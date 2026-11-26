import type { VNode } from 'vue'
import type { LayerDefine, LayerInstance } from '@/types'

export type TemplateToRender = (
  slotProps?: Record<string, unknown>,
) => VNode | VNode[] | null

export type TemplateToContent = {
  render: () => VNode | VNode[] | null
  dispose: () => void
}

/** Local tree stays empty; slot is delivered remotely. */
export const renderless = (): null => null

export type LayerTemplateToCapabilities = {
  template(opts: {
    name: string
    container: boolean
    render: TemplateToRender
  }): TemplateToContent
}

export type LayerTemplateTo = LayerDefine | LayerInstance

export type LayerTemplateToResolved = LayerTemplateToCapabilities

const TEMPLATE_KEY = Symbol('vue-layerx:template')

export function withTemplateTo<T extends LayerTemplateTo>(
  base: T,
  { template }: LayerTemplateToCapabilities,
): T {
  Object.defineProperty(base, TEMPLATE_KEY, {
    value: template,
    enumerable: false,
    writable: false,
    configurable: false,
  })
  return base
}

export function resolveTemplateTo(to: LayerTemplateTo): LayerTemplateToResolved {
  const template = (to as unknown as Record<
    symbol,
    LayerTemplateToCapabilities['template']
  >)[TEMPLATE_KEY]
  return { template }
}
