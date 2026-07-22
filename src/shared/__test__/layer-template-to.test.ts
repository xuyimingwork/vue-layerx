import { describe, expect, it } from 'vitest'
import {
  renderless,
  resolveTemplateTo,
  withTemplateTo,
} from '@/shared/layer-template-to'

describe('layer-template-to', () => {
  it('should expose a shared renderless render fn', () => {
    expect(renderless()).toBeNull()
  })

  it('should attach capabilities as non-enumerable Symbol properties', () => {
    const base = { exists: false }
    withTemplateTo(base, {
      template: () => ({ render: renderless, dispose: () => {} }),
    })

    expect(Object.keys(base)).toEqual(['exists'])
    expect(resolveTemplateTo(base).template).toBeTypeOf('function')
  })

  it('should resolve template capability via proxy', () => {
    const template = () => ({ render: () => 'vnode' as never, dispose: () => {} })
    const base = withTemplateTo({ exists: true }, { template })

    const content = resolveTemplateTo(base).template({
      name: 'footer',
      container: false,
      render: renderless,
    })

    expect(content.render()).toBe('vnode')
  })

  it('should throw TypeError when template capability is missing', () => {
    expect(() =>
      resolveTemplateTo({ exists: false }).template({
        name: 'footer',
        container: false,
        render: renderless,
      }),
    ).toThrow(TypeError)
  })

  it('should forward non-capability properties through the proxy', () => {
    const base = withTemplateTo(
      { exists: true },
      { template: () => ({ render: renderless, dispose: () => {} }) },
    )
    const resolved = resolveTemplateTo(base)

    expect(resolved.exists).toBe(true)
  })
})
