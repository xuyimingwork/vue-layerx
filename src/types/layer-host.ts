import type { ComponentInternalInstance } from 'vue'

/** Runtime instance with provide/inject chain (omitted from public Vue types). */
export type LayerHost = ComponentInternalInstance & {
  provides: Record<string | symbol, unknown>
}
