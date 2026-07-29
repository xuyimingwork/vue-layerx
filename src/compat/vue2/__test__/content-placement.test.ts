import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useContentPlacement } from '../content-placement'
import type { LayerBound } from '@/types'

describe('useContentPlacement (Vue 2.7)', () => {
  it('should expose a no-op placement ref', () => {
    const bound = ref({
      container: { component: {}, props: {} },
    } as LayerBound)
    const visible = computed(() => true)
    const placement = useContentPlacement(bound, visible)

    expect(placement.value).toBeUndefined()
    placement.value = document.createElement('div')
    expect(placement.value).toBeUndefined()
  })
})
