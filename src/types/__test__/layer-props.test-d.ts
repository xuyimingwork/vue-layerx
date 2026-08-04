/**
 * Vue 3 type-level tests for PropsOf + createLayer / $open.
 * Run via `pnpm typecheck` (vitest typecheck / tsc).
 */
import { defineComponent } from 'vue'
import { createLayer } from '@/api/create-layer'
import type { LayerInstance, LooseProps, PropsOf } from '@/types'
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
  setup() {
    return () => null
  },
})

type ContentProps = PropsOf<typeof StubContent>
type ContainerProps = PropsOf<typeof StubContainer>

// --- PropsOf / LayerPropsInput ---

const propsOk: LayerPropsInput<ContentProps> = {
  mode: 'edit',
  recordId: 1,
}
void propsOk

const propsBad = {
  // @ts-expect-error — mode must be string
  mode: 1 as number,
} satisfies LayerPropsInput<ContentProps>
void propsBad

// --- createLayer + useLayer(Content) ---

const useDialog = createLayer(StubContainer, {
  props: { title: 'Default', width: '520px' },
})

createLayer(StubContainer, {
  props: {
    // @ts-expect-error — width must be string
    width: 520,
  },
})

const dialog = useDialog(StubContent, {
  props: { mode: 'edit' },
})

dialog.$open({ mode: 'create', recordId: 2 })
dialog.$open()

dialog.open({
  props: { mode: 'edit' },
  container: { props: { title: 'Edit' } },
})

dialog.$open({
  // @ts-expect-error — mode must be string
  mode: 1,
})

// Hover / expand: single flat object, not Partial<P> & { ref?: … }
type OpenProps = NonNullable<Parameters<typeof dialog.$open>[0]>
type _OpenPropsHasMode = OpenProps extends { mode?: string } ? true : false
const _openPropsShape: _OpenPropsHasMode = true
void _openPropsShape

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

const _typed: LayerInstance<ContentProps, ContainerProps> = dialog
void _typed

// --- unbound Content: loose ---

const unbound = useDialog()
unbound.$open({ anything: true })
unbound.open({ props: { alsoAnything: 1 }, component: StubContent })

const _loose: LayerInstance<LooseProps, ContainerProps> = unbound
void _loose
