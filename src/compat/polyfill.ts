import * as Vue from 'vue'
import { isRef, version } from 'vue'
import type { MaybeRefOrGetter } from '@/types/instance'

export type { MaybeRefOrGetter }

/** True when running under Vue 2.x (incl. 2.7). Bound once at module load. */
export const isVue2 = version.startsWith('2.')

/** Polyfill of Vue 3 `toValue` (D0.9). Do not named-import `toValue` from `vue`. */
export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  return typeof source === 'function'
    ? (source as () => T)()
    : isRef(source)
      ? source.value
      : source
}

/** Vue 2.7 named `set` / `del` (absent on Vue 3). */
type Vue2ReactiveApi = {
  set: <T>(target: object, key: string | number, value: T) => T
  del: (target: object, key: string | number) => void
}

/**
 * Add or replace a property on a reactive object.
 * Vue 2: `Vue.set` so new keys are observed; Vue 3: plain assignment (Proxy).
 * Callers still need the key declared (or a parent get) so Vue 2 can collect deps.
 */
export function set<T>(target: object, key: string | number, value: T): T {
  if (isVue2) {
    return (Vue as unknown as Vue2ReactiveApi).set(target, key, value)
  }
  ;(target as Record<string | number, unknown>)[key] = value
  return value
}

/**
 * Remove a property from a reactive object.
 * Vue 2: `Vue.delete` so dependents re-run; Vue 3: plain `delete`.
 */
export function del(target: object, key: string | number): void {
  if (isVue2) {
    ;(Vue as unknown as Vue2ReactiveApi).del(target, key)
    return
  }
  delete (target as Record<string | number, unknown>)[key]
}
