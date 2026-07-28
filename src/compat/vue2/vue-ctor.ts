import * as VueNS from 'vue'

/** Structural Vue 2.7 constructor (avoid importing Vue as a value named export). */
export type VueCtor = {
  extend: (options: unknown) => new (options?: object) => VueInstance
}

export type VueInstance = {
  $mount: (el?: Element | string) => VueInstance
  $destroy: () => void
  $el: Element
}

export type HostProxy = {
  $root?: { constructor?: VueCtor }
  constructor?: VueCtor
}

/** Prefer `default` (CJS interop) then namespace itself. */
export function vueConstructor(): VueCtor {
  const mod = VueNS as unknown as { default?: VueCtor } & VueCtor
  return (mod.default ?? mod) as VueCtor
}

export function resolveHostVue(host: object | null): VueCtor {
  const proxy = host as HostProxy | null
  return (proxy?.$root?.constructor ?? proxy?.constructor ?? vueConstructor()) as VueCtor
}
