import { describe, expect, it } from 'vitest'
import {
  resolveTemplateTo,
  withTemplateTo,
} from '@/shared/layer-template-to'

describe('layer-template-to', () => {
  it('should attach capabilities as non-enumerable Symbol properties', () => {
    const base = { inLayer: false, outsideLayer: true }
    withTemplateTo(base, {
      template: () => ({ render: () => null }),
    })

    expect(Object.keys(base)).toEqual(['inLayer', 'outsideLayer'])
    expect(resolveTemplateTo(base).template).toBeTypeOf('function')
  })

  it('should resolve template capability via proxy', () => {
    const template = () => ({ render: () => 'vnode' as never })
    const base = withTemplateTo({ inLayer: true, outsideLayer: false }, { template })

    const content = resolveTemplateTo(base).template({
      name: 'footer',
      container: false,
      render: () => null,
    })

    expect(content.render()).toBe('vnode')
  })

  it('should throw TypeError when template capability is missing', () => {
    expect(() =>
      resolveTemplateTo({ inLayer: false, outsideLayer: true }).template({
        name: 'footer',
        container: false,
        render: () => null,
      }),
    ).toThrow(TypeError)
  })

  it('should forward non-capability properties through the proxy', () => {
    const base = withTemplateTo(
      { inLayer: true, outsideLayer: false },
      { template: () => ({ render: () => null }) },
    )
    const resolved = resolveTemplateTo(base)

    expect(resolved.inLayer).toBe(true)
    expect(resolved.outsideLayer).toBe(false)
  })
})
