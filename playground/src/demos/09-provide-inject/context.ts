import type { ComputedRef, InjectionKey } from 'vue'

export interface PlaygroundScope {
  label: string
  tagType: 'primary' | 'success'
}

export const PLAYGROUND_SCOPE_KEY: InjectionKey<ComputedRef<PlaygroundScope>> =
  Symbol('playground-scope')
