import { describe, expect, it } from 'vitest'
import { pickContentConfig, pickContainerConfig } from '../merge-config'

describe('pickContentConfig', () => {
  it('extracts only content node fields', () => {
    expect(
      pickContentConfig({
        props: { message: 'hi' },
        container: { props: { title: 'x' } },
        hideOn: ['done'],
      }),
    ).toEqual({ props: { message: 'hi' } })
  })

  it('returns undefined for empty payload', () => {
    expect(pickContentConfig({})).toBeUndefined()
    expect(pickContentConfig(undefined)).toBeUndefined()
  })
})

describe('pickContainerConfig', () => {
  it('returns container fragment only', () => {
    expect(
      pickContainerConfig({
        props: { message: 'hi' },
        container: { props: { title: 'x' } },
      }),
    ).toEqual({ props: { title: 'x' } })
  })
})
