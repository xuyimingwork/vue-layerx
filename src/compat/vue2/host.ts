import { getCurrentInstance } from 'vue'

type SetupProxy = {
  _isMounted?: boolean
}

/**
 * Flatten Vue 2.7 `getCurrentInstance()` → public `proxy` (Options `this`).
 * Call only while a setup / lifecycle current instance exists.
 */
export function getSetupInstance(): object | null {
  const current = getCurrentInstance() as { proxy?: SetupProxy } | null
  return current?.proxy ?? null
}

/** True while synchronously inside setup (before mount). */
export function hasSetupContext(): boolean {
  const vm = getSetupInstance() as SetupProxy | null
  if (!vm) return false
  return vm._isMounted !== true
}
