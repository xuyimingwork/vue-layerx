import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { mergeSlots } from '../../../src/domain/config/merge-slots'

describe('mergeSlots', () => {
  it('returns empty object when no sources', () => {
    expect(mergeSlots()).toEqual({})
  })

  it('merges slot refs with later overriding', () => {
    const footerA = ref({ render: () => null })
    const footerB = ref({ render: () => null })
    const header = ref({ render: () => null })

    const merged = mergeSlots({ footer: footerA }, { footer: footerB, header })
    expect(merged.footer).toBe(footerB)
    expect(merged.header).toBe(header)
  })
})
