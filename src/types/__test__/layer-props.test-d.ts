import { describe, expectTypeOf, test } from 'vitest'
import { defineComponent } from 'vue'
import { ElDialog } from 'element-plus'
import { createLayer } from '@/api/create-layer'
import type {
  LayerHook,
  LayerInstance,
  LooseProps,
  PropsOf,
} from '@/types'
import type { LayerPropsInput } from '@/types/component-props'

const StubContainer = defineComponent({
  props: {
    title: String,
    width: { type: String, default: '480px' },
  },
  setup() {
    return () => null
  },
})

const StubContent = defineComponent({
  props: {
    mode: { type: String, required: true as const },
    recordId: Number,
  },
  emits: {
    success: (_name: string) => true,
  },
  setup() {
    return () => null
  },
})

type ContentProps = PropsOf<typeof StubContent>
type ContainerProps = PropsOf<typeof StubContainer>

/** Props param of an open-like fn; `unknown` here means IDE hints are gone. */
type PropsParam<F extends (...args: any) => any> = NonNullable<Parameters<F>[0]>

describe('LayerPropsInput', () => {
  test('declared keys keep precise types', () => {
    type In = LayerPropsInput<ContentProps>
    expectTypeOf<In['mode']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<In['recordId']>().toEqualTypeOf<number | undefined>()
  })

  test('accepts declared props', () => {
    expectTypeOf({ mode: 'edit', recordId: 1 }).toExtend<
      LayerPropsInput<ContentProps>
    >()
  })

  test('rejects wrong prop type', () => {
    const bad = {
      // @ts-expect-error — mode must be string
      mode: 1 as number,
    } satisfies LayerPropsInput<ContentProps>
    void bad
  })

  test('Vue 3 emit listener stays precise', () => {
    expectTypeOf({ onSuccess: (_name: string) => {} }).toExtend<
      LayerPropsInput<ContentProps>
    >()
    const bad = {
      // @ts-expect-error — success payload is string, not number
      onSuccess: (_name: number) => {},
    } satisfies LayerPropsInput<ContentProps>
    void bad
  })

  test('undeclared keys allowed (Vue 2 onXxx / custom props)', () => {
    expectTypeOf({ mode: 'edit', customFlag: true, onCancel: () => {} }).toExtend<
      LayerPropsInput<ContentProps>
    >()
  })

  test('loose input accepts arbitrary props', () => {
    expectTypeOf({ width: '480px', appendToBody: true }).toExtend<
      LayerPropsInput<LooseProps>
    >()
  })
})

describe('createLayer', () => {
  test('returns a hook typed by container props', () => {
    expectTypeOf(createLayer(StubContainer)).toEqualTypeOf<
      LayerHook<ContainerProps>
    >()
  })

  test('create props are typed by the container', () => {
    createLayer(StubContainer, { props: { title: 'Default', width: '520px' } })
    createLayer(StubContainer, {
      props: {
        // @ts-expect-error — width must be string
        width: 520,
      },
    })
  })

  test('container component is the first arg, not config', () => {
    createLayer(StubContainer, {
      // @ts-expect-error — container component is the first arg
      component: StubContainer,
    })
  })

  test('Element Plus container props are typed', () => {
    createLayer(ElDialog, { props: { width: '480px', appendToBody: true } })
    createLayer(ElDialog, {
      props: {
        // @ts-expect-error — appendToBody is boolean
        appendToBody: 'yes',
      },
    })
  })
})

describe('useLayer (bound Content)', () => {
  const useDialog = createLayer(StubContainer)
  const dialog = useDialog(StubContent, { props: { mode: 'edit' } })

  test('instance is typed by content + container props', () => {
    expectTypeOf(dialog).toEqualTypeOf<
      LayerInstance<ContentProps, ContainerProps>
    >()
  })

  test('use config: content is the first arg', () => {
    // @ts-expect-error — content component is the first arg
    useDialog(StubContent, { component: StubContent })
    useDialog(StubContent, { container: { component: StubContainer } })
  })

  test('$open / $confirm props are typed by content', () => {
    expectTypeOf<PropsParam<typeof dialog.$open>['mode']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<PropsParam<typeof dialog.$confirm>['mode']>().toEqualTypeOf<
      string | undefined
    >()

    dialog.$open()
    dialog.$open({ mode: 'create', recordId: 2 })
    dialog.$open({ mode: 'edit', onSuccess: (_name: string) => {} })
    dialog.$open({
      // @ts-expect-error — mode must be string
      mode: 1,
    })
    dialog.$open({
      // @ts-expect-error — success payload is string
      onSuccess: (_name: number) => {},
    })
  })

  test('open / confirm / clone: content + container props are typed', () => {
    type Config = PropsParam<typeof dialog.open>
    expectTypeOf<NonNullable<Config['props']>['mode']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<
      NonNullable<NonNullable<Config['container']>['props']>['title']
    >().toEqualTypeOf<string | undefined>()
    expectTypeOf(dialog.confirm).parameter(0).toEqualTypeOf<Config | undefined>()

    dialog.open({
      props: { mode: 'edit' },
      container: { props: { title: 'Edit' } },
    })
    dialog.open({
      props: {
        // @ts-expect-error — mode must be string
        mode: 1,
      },
    })
    dialog.open({
      container: {
        props: {
          // @ts-expect-error — title must be string
          title: 1,
        },
      },
    })
    expectTypeOf(dialog.clone()).toEqualTypeOf<
      LayerInstance<ContentProps, ContainerProps>
    >()
  })
})

describe('useLayer (unbound Content)', () => {
  const useDialog = createLayer(StubContainer)

  test('content props are loose, container props stay typed', () => {
    const unbound = useDialog()
    expectTypeOf(unbound).toEqualTypeOf<
      LayerInstance<LooseProps, ContainerProps>
    >()
    unbound.$open({ anything: true })
    unbound.open({ props: { alsoAnything: 1 }, component: StubContent })
    unbound.open({
      container: {
        props: {
          // @ts-expect-error — title must be string
          title: 1,
        },
      },
    })
  })

  test('component belongs on open, not use config', () => {
    // @ts-expect-error — unbound: set component on open, not use config
    useDialog(undefined, { component: StubContent })
  })
})
