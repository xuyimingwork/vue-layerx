import { isRef } from 'vue'
import type { MaybeRefOrGetter } from '@/types/instance'

export type { MaybeRefOrGetter }

/** Polyfill of Vue 3 `toValue` (D0.9). Do not named-import `toValue` from `vue`. */
export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return typeof source === 'function'
    ? (source as () => T)()
    : isRef(source)
      ? source.value
      : source
}
