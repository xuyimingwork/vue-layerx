import type { VNode } from 'vue'

/**
 * Vue 2.7: Symbol keys on h() data are unreliable; use a plain data field.
 * Must not collide with user props (not placed under props/).
 */
const LAYER_CONTENT = 'vueLayerxLayerContent'

/** Aligns with Vue 3 `modelValue`: Vue 2.7 default v-model is `value` + `input`. */
export const DEFAULT_CONTAINER_MODEL = 'value' as const

/**
 * Flat listener prop for container v-model (Vue 2.7).
 * Default `value` → `onInput`; otherwise `onUpdate:${model}`.
 */
export function toModelUpdateProp(model: string): string {
  if (model === 'value') return 'onInput'
  return `onUpdate:${model}`
}

type PlatformData = {
  key?: unknown
  ref?: unknown
  props?: Record<string, unknown>
  on?: Record<string, unknown>
  attrs?: Record<string, unknown>
  [LAYER_CONTENT]?: true
} & Record<string | symbol, unknown>

/**
 * Convert Vue 3 flat props (onXxx / onUpdate:x) to Vue 2.7 h() data.
 * Does NOT remap value→input (already expressed as onInput via D0.20).
 */
export function toPlatformVNodeData(flat: Record<string | symbol, unknown>): PlatformData {
  const props: Record<string, unknown> = {}
  const on: Record<string, unknown> = {}
  const data: PlatformData = { props, on }
  let hasOn = false

  for (const key of Reflect.ownKeys(flat)) {
    const value = flat[key]
    if (key === LAYER_CONTENT) {
      data[LAYER_CONTENT] = true
      continue
    }
    if (typeof key === 'symbol') {
      data[key] = value
      continue
    }
    if (key === 'key') {
      data.key = value
      continue
    }
    if (key === 'ref') {
      data.ref = value
      continue
    }
    if (key === 'class' || key === 'style') {
      data[key] = value
      continue
    }
    if (key.startsWith('on') && key.length > 2) {
      const eventName = flatOnToVue2Event(key)
      if (eventName) {
        on[eventName] = value
        hasOn = true
        continue
      }
    }
    props[key] = value
  }

  if (!hasOn) delete data.on
  if (Object.keys(props).length === 0) delete data.props
  return data
}

function flatOnToVue2Event(key: string): string | null {
  if (key.startsWith('onUpdate:')) {
    return `update:${key.slice('onUpdate:'.length)}`
  }
  if (key === 'onInput') return 'input'
  if (/^on[A-Z]/.test(key)) {
    return key[2]!.toLowerCase() + key.slice(3)
  }
  return null
}

/** Vue 2.7: function-slot map → scopedSlots (omit when empty so h() data stays clean). */
export function toPlatformSlots(
  slots: Record<string, ((...args: never[]) => VNode | VNode[] | null) | undefined>,
): { scopedSlots?: Record<string, ((...args: never[]) => VNode | VNode[] | null) & { proxy?: boolean }> } {
  const scopedSlots: Record<
    string,
    ((...args: never[]) => VNode | VNode[] | null) & { proxy?: boolean }
  > = {}
  for (const [name, render] of Object.entries(slots)) {
    if (!render) continue
    // Vue 2.6+: `proxy: true` reverse-proxies onto `$slots` so Element UI
    // `v-if="$slots.footer"` sees named slots passed only via scopedSlots.
    const fn = ((...args: never[]) => render(...args)) as ((
      ...args: never[]
    ) => VNode | VNode[] | null) & { proxy?: boolean }
    fn.proxy = true
    scopedSlots[name] = fn
  }
  if (Object.keys(scopedSlots).length === 0) return {}
  return { scopedSlots }
}

export function markLayerContent(
  props: Record<string | symbol, unknown>,
): Record<string | symbol, unknown> {
  return { ...props, [LAYER_CONTENT]: true }
}

export function isLayerContent(instance: object | null | undefined): boolean {
  if (!instance) return false
  // Expect setup proxy (getSetupInstance) or Options `this` — both expose $vnode.
  const data = (instance as { $vnode?: { data?: Record<string, unknown> } }).$vnode
    ?.data
  return data?.[LAYER_CONTENT] === true
}
