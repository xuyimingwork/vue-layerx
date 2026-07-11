import type { VNode } from 'vue'
import type { LayerDefine, LayerInstance } from '@/types'

export type TemplateToRender = (
  slotProps?: Record<string, unknown>,
) => VNode | VNode[] | null

export type TemplateToContent = {
  render: () => VNode | VNode[] | null
}

export type LayerTemplateToCapabilities = {
  template(opts: {
    name: string
    container: boolean
    render: TemplateToRender
  }): TemplateToContent
}

export type LayerTemplateTo = LayerDefine | LayerInstance

export type LayerTemplateToResolved = LayerTemplateTo & LayerTemplateToCapabilities

const TEMPLATE_TO_KEYS = {
  template: Symbol('vue-layerx:template-to:template'),
} as const satisfies Record<keyof LayerTemplateToCapabilities, symbol>

export function withTemplateTo<T extends LayerTemplateTo>(
  base: T,
  capabilities: LayerTemplateToCapabilities,
): T {
  for (const key of Object.keys(capabilities) as (keyof LayerTemplateToCapabilities)[]) {
    Object.defineProperty(base, TEMPLATE_TO_KEYS[key], {
      value: capabilities[key],
      enumerable: false,
      writable: false,
      configurable: false,
    })
  }
  return base
}

export function resolveTemplateTo(to: LayerTemplateTo): LayerTemplateToResolved {
  return new Proxy(to, {
    get(target, prop, receiver) {
      return Reflect.get(
        target,
        typeof prop === 'string' && prop in TEMPLATE_TO_KEYS
          ? TEMPLATE_TO_KEYS[prop as keyof typeof TEMPLATE_TO_KEYS]
          : prop,
        receiver,
      )
    },
  }) as LayerTemplateToResolved
}
