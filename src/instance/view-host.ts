import type { ComponentInternalInstance } from 'vue'

/** Runtime instance with provide/inject chain (omitted from public Vue types). */
export type ViewHost = ComponentInternalInstance & {
  provides: Record<string | symbol, unknown>
}

export type GetViewHost = () => ViewHost | null

export function asViewHost(instance: ComponentInternalInstance): ViewHost {
  return instance as ViewHost
}
