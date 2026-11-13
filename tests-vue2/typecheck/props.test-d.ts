/**
 * Vue 2.7: the package `.d.ts` must compile and keep props precise.
 * Emit listeners are not on Vue 2 `$props`, so they stay loose (index signature).
 */
import { describe, expectTypeOf, test } from 'vitest'
import { defineComponent } from 'vue'
import { createLayer } from 'vue-layerx'
import type { LayerInstance, PropsOf } from 'vue-layerx'

const StubContainer = defineComponent({
  props: {
    title: String,
    width: String,
  },
  render(h: any) {
    return h('div')
  },
})

const StubContent = defineComponent({
  props: {
    mode: { type: String, required: true },
    recordId: Number,
  },
  render(h: any) {
    return h('div')
  },
})

type ContentProps = PropsOf<typeof StubContent>
type ContainerProps = PropsOf<typeof StubContainer>

describe('PropsOf (Vue 2.7)', () => {
  test('infers declared props', () => {
    expectTypeOf<keyof ContentProps>().toEqualTypeOf<'mode' | 'recordId'>()
    expectTypeOf<ContentProps['mode']>().toEqualTypeOf<string>()
    expectTypeOf<keyof ContainerProps>().toEqualTypeOf<'title' | 'width'>()
  })
})

describe('createLayer / useLayer (Vue 2.7)', () => {
  const useDialog = createLayer(StubContainer, {
    props: { title: 'Default', width: '520px' },
  })
  const dialog = useDialog(StubContent, { props: { mode: 'edit' } })

  test('instance is typed by content + container props', () => {
    expectTypeOf(dialog).toEqualTypeOf<
      LayerInstance<ContentProps, ContainerProps>
    >()
  })

  test('create props are typed by the container', () => {
    createLayer(StubContainer, {
      props: {
        // @ts-expect-error — title must be string
        title: 1,
      },
    })
  })

  test('$open / open props are typed', () => {
    dialog.$open({ mode: 'create', recordId: 2 })
    dialog.open({
      props: { mode: 'edit' },
      container: { props: { title: 'Edit' } },
    })
    dialog.$open({
      // @ts-expect-error — mode must be string
      mode: 1,
    })
    dialog.open({
      container: {
        props: {
          // @ts-expect-error — title must be string
          title: 1,
        },
      },
    })
  })

  test('unbound content stays loose', () => {
    const unbound = useDialog()
    unbound.$open({ anything: true })
  })
})
