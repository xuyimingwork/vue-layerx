import { computed, defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createLayerStore } from '@/runtime/layer-store'

describe('createLayerStore', () => {
  it('should point getters at the latest setup record', () => {
    const store = createLayerStore({})
    expect(store.define).toEqual({})
    expect(store['define:template']).toEqual({})

    store.setup(
      'define',
      computed(() => ({ container: { props: { title: 'A' } } })),
    )
    store.setup(
      'define',
      computed(() => ({ container: { props: { title: 'B' } } })),
    )

    expect(store.define).toEqual({ container: { props: { title: 'B' } } })
  })

  it('should keep an older teardown from clearing the active record', () => {
    const store = createLayerStore({})

    const first = mount(
      defineComponent({
        setup() {
          store.setup(
            'define',
            computed(() => ({ container: { props: { title: 'A' } } })),
          )
          return () => null
        },
      }),
    )
    const second = mount(
      defineComponent({
        setup() {
          const current = store.setup(
            'define',
            computed(() => ({ container: { props: { title: 'B' } } })),
          )
          current.template({
            name: 'footer',
            side: 'container',
            render: () => null,
          })
          return () => null
        },
      }),
    )

    first.unmount()

    expect(store.define).toEqual({ container: { props: { title: 'B' } } })
    expect(store['define:template'].container?.slots?.footer).toBeTypeOf('function')

    second.unmount()

    expect(store.define).toEqual({})
    expect(store['define:template']).toEqual({})
  })

  it('should leave config in place when one template slot is disposed', () => {
    const store = createLayerStore({})
    const footer = () => null
    const { template } = store.setup(
      'define',
      computed(() => ({
        container: { props: { title: 'A' }, slots: { footer } },
      })),
    )
    const dispose = template({
      name: 'extra',
      side: 'container',
      render: () => null,
    })

    expect(store['define:template'].container?.slots?.extra).toBeTypeOf('function')
    dispose()

    // Source slots are wrapped with a setup-generation LayerSlotFragment key.
    expect(store.define.container?.props?.title).toBe('A')
    expect(store.define.container?.slots?.footer).toBeTypeOf('function')
    expect(store.define.container?.slots?.footer).not.toBe(footer)
    expect(store['define:template'].container?.slots?.extra).toBeUndefined()
  })

  it('should drop a slot only when the disposing render is still the one stored', () => {
    const store = createLayerStore({})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { template } = store.setup('use', computed(() => ({})))
    const disposeFirst = template({
      name: 'footer',
      side: 'container',
      render: () => null,
    })
    template({
      name: 'footer',
      side: 'container',
      render: () => null,
    })

    disposeFirst()
    expect(store['use:template'].container?.slots?.footer).toBeTypeOf('function')
    warn.mockRestore()
  })

  it('should noop a template write after a newer setup overwrites the pair', () => {
    const store = createLayerStore({})
    const first = store.setup('define', computed(() => ({})))
    store.setup('define', computed(() => ({ container: { props: { title: 'B' } } })))

    const dispose = first.template({
      name: 'footer',
      side: 'container',
      render: () => null,
    })
    dispose()

    expect(store.define).toEqual({ container: { props: { title: 'B' } } })
    expect(store['define:template']).toEqual({})
  })

  it('should track template slot writes and live config', () => {
    const store = createLayerStore({})
    const title = ref('A')
    const { template } = store.setup(
      'define',
      computed(() => ({ container: { props: { title: title.value } } })),
    )
    const seenTitle = computed(() => store.define.container?.props?.title)
    const seenFooter = computed(
      () => store['define:template'].container?.slots?.footer,
    )

    expect(seenTitle.value).toBe('A')
    expect(seenFooter.value).toBeUndefined()

    title.value = 'B'
    const dispose = template({
      name: 'footer',
      side: 'container',
      render: () => null,
    })

    expect(seenTitle.value).toBe('B')
    expect(seenFooter.value).toBeTypeOf('function')

    dispose()
    expect(seenFooter.value).toBeUndefined()
    expect(seenTitle.value).toBe('B')
  })

  it('should warn when the same generation registers a slot name twice', () => {
    const store = createLayerStore({})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { template } = store.setup('define', computed(() => ({})))

    template({ name: 'footer', side: 'container', render: () => null })
    template({ name: 'footer', side: 'container', render: () => null })

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Duplicate LayerTemplate name="footer" in define:template.container',
      ),
    )
    warn.mockRestore()
  })
})
