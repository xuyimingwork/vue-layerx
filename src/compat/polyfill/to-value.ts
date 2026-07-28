import { isRef, type Ref } from 'vue'

/** Local shim — Vue 2.7 has no MaybeRefOrGetter in its public types. */
export type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)

/** Polyfill of Vue 3 `toValue` (D0.9). Do not named-import `toValue` from `vue`. */
export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return typeof source === 'function'
    ? (source as () => T)()
    : isRef(source)
      ? source.value
      : source
}
