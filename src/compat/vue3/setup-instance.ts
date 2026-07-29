import { getCurrentInstance } from 'vue'

type SetupInternal = {
  isMounted?: boolean
}

/**
 * Vue 3: same as `getCurrentInstance()` (internal instance for appContext / provides).
 */
export const getSetupInstance = getCurrentInstance

/** True while synchronously inside setup (before mount). */
export function hasSetupContext(): boolean {
  const vm = getSetupInstance() as SetupInternal | null
  if (!vm) return false
  return vm.isMounted !== true
}
