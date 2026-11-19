import * as VueNS from 'vue'
import { h as createElement, type Component, type VNode } from 'vue'
import { LAYER_CONTENT } from '@/shared/layer-content'

/** Aligns with Vue 3 `modelValue`: Vue 2.7 default v-model is `value` + `input`. */
export const DEFAULT_CONTAINER_MODEL = 'value' as const

/** Multi-child shell tag; keep Vue from treating it as an unknown component. */
const LAYER_FRAGMENT_TAG = 'layer-fragment'

function ensureIgnoredElements(): void {
  const mod = VueNS as unknown as {
    default?: { config?: { ignoredElements?: (string | RegExp)[] } }
    config?: { ignoredElements?: (string | RegExp)[] }
  }
  const config = (mod.default ?? mod).config
  if (!config) return
  const ignored = config.ignoredElements ?? (config.ignoredElements = [])
  if (ignored.includes(LAYER_FRAGMENT_TAG)) return
  ignored.push(LAYER_FRAGMENT_TAG)
}

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
  const attrs: Record<string, unknown> = {}
  const on: Record<string, unknown> = {}
  const data: PlatformData = { attrs, on }
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
    attrs[key] = value
  }

  if (!hasOn) delete data.on
  if (Object.keys(attrs).length === 0) delete data.attrs
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

/**
 * `h(type, props, defaultSlot)`.
 * Vue 2.7 only promotes a children array whose first item is a function into the default scoped slot.
 */
export function h(
  type: Component,
  props: object | null,
  render: () => VNode | VNode[] | null,
): VNode {
  return createElement(type, props, [render] as never)
}

/**
 * Component render must be a single root on Vue 2 (no Fragment).
 * Multiple slot children → `<layer-fragment style="display:contents">`
 * (same custom-element + contents pattern as Vue 3 `layer-content-to`).
 */
export function toComponentRoot(
  nodes: VNode | VNode[] | null | undefined,
): VNode | null {
  if (nodes == null) return null
  if (!Array.isArray(nodes)) return nodes
  if (nodes.length === 0) return null
  if (nodes.length === 1) return nodes[0] ?? null
  ensureIgnoredElements()
  return createElement(LAYER_FRAGMENT_TAG, { style: { display: 'contents' } }, nodes)
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
  const data = (instance as { $vnode?: { data?: Record<PropertyKey, unknown> } }).$vnode
    ?.data
  return data?.[LAYER_CONTENT] === true
}
