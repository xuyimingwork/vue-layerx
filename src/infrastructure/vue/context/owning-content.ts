import type { ComponentInternalInstance } from 'vue'

/** Nearest component ancestor that rendered this instance (e.g. LayerSlot → UserForm). */
export function getOwningContentInstance(
  instance: ComponentInternalInstance | null | undefined,
): ComponentInternalInstance | null {
  let cur = instance?.parent ?? null
  while (cur) {
    const type = cur.type
    if (typeof type === 'object' || typeof type === 'function') {
      return cur
    }
    cur = cur.parent
  }
  return null
}
