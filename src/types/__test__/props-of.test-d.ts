import { describe, expectTypeOf, test } from 'vitest'
import { defineComponent, type Component } from 'vue'
import { ElDialog, ElDrawer } from 'element-plus'
import type { LooseProps, PropsOf } from '@/types'

/** Loose = props degraded to an index signature (no IDE hints for real keys). */
type IsLoose<P> = string extends keyof P ? true : false

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

describe('PropsOf — defineComponent', () => {
  type P = PropsOf<typeof StubContent>

  test('keeps exactly declared props + emit listeners', () => {
    expectTypeOf<keyof P>().toEqualTypeOf<'mode' | 'recordId' | 'onSuccess'>()
  })

  test('keeps precise prop types', () => {
    expectTypeOf<P['mode']>().toEqualTypeOf<string>()
    expectTypeOf<P['recordId']>().toEqualTypeOf<number | undefined>()
    expectTypeOf<NonNullable<P['onSuccess']>>().parameters.toEqualTypeOf<[string]>()
  })

  test('drops Vue builtin $props keys', () => {
    expectTypeOf<P>().not.toHaveProperty('key')
    expectTypeOf<P>().not.toHaveProperty('ref')
    expectTypeOf<P>().not.toHaveProperty('class')
    expectTypeOf<P>().not.toHaveProperty('onVnodeMounted')
  })
})

describe('PropsOf — Element Plus', () => {
  test('ElDialog props are inferred, not loose', () => {
    type P = PropsOf<typeof ElDialog>
    expectTypeOf<IsLoose<P>>().toEqualTypeOf<false>()
    expectTypeOf<P>().toHaveProperty('modelValue')
    expectTypeOf<P>().toHaveProperty('title')
    expectTypeOf<P>().toHaveProperty('width')
    expectTypeOf<P>().toHaveProperty('onClosed')
    expectTypeOf<P['appendToBody']>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<P>().not.toHaveProperty('onVnodeMounted')
  })

  test('ElDrawer props are inferred, not loose', () => {
    type P = PropsOf<typeof ElDrawer>
    expectTypeOf<IsLoose<P>>().toEqualTypeOf<false>()
    expectTypeOf<P>().toHaveProperty('direction')
    expectTypeOf<P>().toHaveProperty('size')
  })
})

describe('PropsOf — functional component', () => {
  test('infers from the first parameter', () => {
    const Fn = (_props: { label: string; count?: number }) => null
    type P = PropsOf<typeof Fn>
    expectTypeOf<keyof P>().toEqualTypeOf<'label' | 'count'>()
    expectTypeOf<P['label']>().toEqualTypeOf<string>()
  })
})

describe('PropsOf — uninferable falls back to LooseProps', () => {
  test('Vue Component', () => {
    expectTypeOf<PropsOf<Component>>().toEqualTypeOf<LooseProps>()
  })

  test('plain options object', () => {
    expectTypeOf<PropsOf<{ name: string }>>().toEqualTypeOf<LooseProps>()
  })

  test('component without props', () => {
    const Empty = defineComponent({
      setup() {
        return () => null
      },
    })
    expectTypeOf<PropsOf<typeof Empty>>().toEqualTypeOf<LooseProps>()
  })
})
