import type { Ref } from 'vue'
import type { LayerRefCallback } from './config'

/**
 * Flatten intersections / mapped types so IDE hovers show a single object shape
 * instead of `A & B & …`. Same idea as type-fest `Simplify` / vue `Prettify`.
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {}

/**
 * Component-like value for `createLayer` / `useLayer`.
 * Not Vue's `Component`: under one package `.d.ts`, Vue 2.7 and Vue 3 `Component`
 * are not mutually assignable (`SetupContext.listeners` vs `expose`).
 */
export type AnyComponent =
  | (abstract new (...args: any) => any)
  | Record<string, any>
  | ((...args: any[]) => any)

/**
 * Keys Vue puts on `$props` that are not component-declared props.
 * Local list so Vue 2.7 / 3 share one `.d.ts` (no VNodeProps import).
 */
type VueBuiltinPropKeys =
  | 'key'
  | 'ref'
  | 'ref_for'
  | 'ref_key'
  | 'class'
  | 'style'
  | 'onVnodeBeforeMount'
  | 'onVnodeMounted'
  | 'onVnodeBeforeUpdate'
  | 'onVnodeUpdated'
  | 'onVnodeBeforeUnmount'
  | 'onVnodeUnmounted'

/**
 * Extract public props from a component definition.
 * `[C] extends […]` is **non-distributive**: Vue / UI-lib `Component` unions
 * must not become `PropsOf<A> | PropsOf<B>` (keyof that union is often `never`,
 * which makes `LayerPropsInput` reject every real prop like `width`).
 * Falls back to a loose record when the shape cannot be inferred.
 */
export type PropsOf<C> = [C] extends [
  new (...args: any[]) => { $props: infer P },
]
  ? NormalizeProps<Omit<NonNullable<P>, VueBuiltinPropKeys>>
  : [C] extends [(props: infer P, ...args: any[]) => any]
    ? NormalizeProps<Omit<NonNullable<P>, VueBuiltinPropKeys>>
    : LooseProps

/** Empty / unusable key sets → loose record (safe for Element UI etc.). */
type NormalizeProps<P> = [keyof P & string] extends [never]
  ? LooseProps
  : Simplify<P>

/**
 * User-facing props input for typed open / use / create configs.
 *
 * - Keys from `P` keep **precise** types (Vue 3: `onSuccess` payload etc.)
 * - String index allows undeclared keys (Vue 2 emit listeners not on `$props`,
 *   custom props, Element UI bags when PropsOf is loose)
 */
export type LayerPropsInput<P = LooseProps> = Partial<P> & {
  ref?: LayerRefCallback | Ref<unknown>
  [extra: string]: unknown
}

/** Loose fallback when no Content / Container props are bound. */
export type LooseProps = Record<string, unknown>
