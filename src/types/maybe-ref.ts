import type { Ref } from 'vue'

/** Local shim — Vue 2.7 has no MaybeRefOrGetter in its public types. */
export type MaybeRefOrGetter<T> = T | Ref<T> | (() => T)
