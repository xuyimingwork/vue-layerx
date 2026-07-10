import type { VNode } from 'vue'

export const LAYER_TEMPLATE_TO = Symbol('vue-layerx:template-to')

export type LayerTemplateSlotRender = (
  slotProps?: Record<string, unknown>,
) => VNode | VNode[] | null

export type LayerTemplateContent = {
  render: () => VNode | VNode[] | null
}

export type LayerTemplateToHandler = {
  template: (opts: {
    name: string
    container: boolean
    render: LayerTemplateSlotRender
  }) => LayerTemplateContent
}

export type LayerTemplateToHost = {
  readonly [LAYER_TEMPLATE_TO]?: LayerTemplateToHandler
}

export function setupLayerTemplateTo(
  host: object,
  handler: LayerTemplateToHandler,
): void {
  Object.defineProperty(host, LAYER_TEMPLATE_TO, {
    value: handler,
    enumerable: false,
    writable: false,
    configurable: false,
  })
}

export function getLayerTemplateTo(host: object): LayerTemplateToHandler {
  const handler = (host as LayerTemplateToHost)[LAYER_TEMPLATE_TO]
  if (!handler) {
    throw new Error('[vue-layerx] LayerTemplate :to is missing template handler')
  }
  return handler
}
