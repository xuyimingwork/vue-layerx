import type { ComputedRef, InjectionKey } from 'vue'

export interface DemoScope {
  label: string
  tagType: 'primary' | 'success'
}

export const DEMOS_SCOPE_KEY: InjectionKey<ComputedRef<DemoScope>> =
  Symbol('demos-scope')
