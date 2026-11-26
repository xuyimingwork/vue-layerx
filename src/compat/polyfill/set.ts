import * as Vue from 'vue'
import { isVue2 } from '../env'

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
