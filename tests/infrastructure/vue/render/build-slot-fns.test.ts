import { h, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { buildSlotFns } from '../../../../src/infrastructure/vue/render/build-slot-fns'

describe('buildSlotFns', () => {
  it('returns empty object for no slots', () => {
    expect(buildSlotFns({}, 0)).toEqual({})
  })

  it('delegates to slot ref render()', () => {
    const footer = ref({
      render: () => h('button', { class: 'footer-btn' }, 'ok'),
    })

    const fns = buildSlotFns({ footer }, 1)
    const vnode = fns.footer()

    expect(vnode).toBeTruthy()
    expect((vnode as { props?: { class?: string } }).props?.class).toBe('footer-btn')
  })

  it('returns null when slot ref is undefined', () => {
    const footer = ref(undefined)
    const fns = buildSlotFns({ footer }, 0)
    expect(fns.footer()).toBeNull()
  })
})
