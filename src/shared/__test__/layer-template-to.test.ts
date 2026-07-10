import { describe, expect, it } from 'vitest'
import {
  setupLayerTemplateTo,
  getLayerTemplateTo,
  LAYER_TEMPLATE_TO,
} from '@/shared/layer-template-to'

describe('layer-template-to', () => {
  it('should attach LAYER_TEMPLATE_TO as non-enumerable on host', () => {
    const host = {}
    const handler = { template: () => ({ render: () => null }) }
    setupLayerTemplateTo(host, handler)

    expect(LAYER_TEMPLATE_TO in host).toBe(true)
    expect(Object.keys(host)).toEqual([])
    expect(getLayerTemplateTo(host)).toBe(handler)
  })

  it('should throw when template handler is missing', () => {
    expect(() => getLayerTemplateTo({})).toThrow(
      '[vue-layerx] LayerTemplate :to is missing template handler',
    )
  })
})
