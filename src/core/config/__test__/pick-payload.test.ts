import { describe, expect, it } from 'vitest'
import { pickContentConfig, pickLayerConfig } from '../merge-config'

describe('pickContentConfig', () => {
  it('extracts only content node fields', () => {
    expect(
      pickContentConfig({
        props: { message: 'hi' },
        layer: { props: { title: 'x' } },
        hideOn: ['done'],
      }),
    ).toEqual({ props: { message: 'hi' } })
  })

  it('returns undefined for empty payload', () => {
    expect(pickContentConfig({})).toBeUndefined()
    expect(pickContentConfig(undefined)).toBeUndefined()
  })
})

describe('pickLayerConfig', () => {
  it('returns layer fragment only', () => {
    expect(
      pickLayerConfig({
        props: { message: 'hi' },
        layer: { props: { title: 'x' } },
      }),
    ).toEqual({ props: { title: 'x' } })
  })
})
