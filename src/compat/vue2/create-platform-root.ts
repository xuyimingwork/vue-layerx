import * as VueNS from 'vue'
import type { Component } from 'vue'
import type { LayerHost, PlatformRootHandle } from '@/compat/types'

export type { PlatformRootHandle }

type HostVueConstructor = {
  extend: (options: unknown) => new (options?: object) => PlatformVm
}

type PlatformVm = {
  $mount: (el?: Element | string) => PlatformVm
  $destroy: () => void
  $el: Element
}

/** Prefer host app's Vue; fall back to this package's `vue` (CJS `default` or namespace). */
function resolveHostConstructor(host: object | null): HostVueConstructor {
  const proxy = host as {
    $root?: { constructor?: HostVueConstructor }
    constructor?: HostVueConstructor
  } | null
  if (proxy?.$root?.constructor) return proxy.$root.constructor
  if (proxy?.constructor) return proxy.constructor
  const mod = VueNS as unknown as { default?: HostVueConstructor } & HostVueConstructor
  return (mod.default ?? mod) as HostVueConstructor
}

/**
 * Vue 2.7: `HostVue.extend` + `parent`. Host is wired at construct time; `setup` is a no-op.
 */
export function createPlatformRoot({
  root,
  host,
}: {
  root: Component
  host: LayerHost | null
}): PlatformRootHandle {
  let vm: PlatformVm | null = null
  const HostVue = resolveHostConstructor(host)
  const Ctor = HostVue.extend(root)

  return {
    host,
    setup() {},
    mount(el) {
      if (vm) return
      vm = new Ctor(host ? { parent: host } : {})
      vm.$mount()
      el.appendChild(vm.$el)
    },
    unmount() {
      if (!vm) return
      vm.$destroy()
      vm = null
    },
  }
}
