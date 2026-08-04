import type { Ref } from 'vue'
import type { LayerRefCallback } from './config'

/**
 * Flatten intersections / mapped types so IDE hovers show a single object shape
 * instead of `A & B & …`. Same idea as type-fest `Simplify` / vue `Prettify`.
 */
export type Simplify<T> = { [K in keyof T]: T[K] } & {}

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

/**
 * Extract public props from a component definition.
 * Local shim for Vue 2.7 + Vue 3 (single package `.d.ts`, ADR 0008 D0.14).
 * Falls back to a loose record when the shape cannot be inferred.
 */
export type PropsOf<C> = C extends new (...args: any[]) => { $props: infer P }
  ? Simplify<Omit<NonNullable<P>, VueBuiltinPropKeys>>
  : C extends (props: infer P, ...args: any[]) => any
    ? Simplify<Omit<NonNullable<P>, VueBuiltinPropKeys>>
    : Record<string, unknown>

/**
 * User-facing props input for typed open / use / create configs.
 * Partial because defaults may already exist on lower merge tiers.
 * No open index signature — excess property checks must work.
 */
export type LayerPropsInput<P = Record<string, unknown>> = Simplify<
  Partial<P> & {
    ref?: LayerRefCallback | Ref<unknown>
  }
>

/** Loose fallback when no Content / Container props are bound. */
export type LooseProps = Record<string, unknown>
