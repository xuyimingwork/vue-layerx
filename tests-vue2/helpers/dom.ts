import Vue, { defineComponent, h, type Component } from 'vue'
import { vi } from 'vitest'

export function clearBody() {
  document.body.innerHTML = ''
}

export function withoutDom<T>(run: () => T): T {
  const originalDocument = globalThis.document
  vi.stubGlobal('document', undefined)
  try {
    return run()
  } finally {
    vi.stubGlobal('document', originalDocument)
  }
}

export function flushPromises() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/** Mount a setup-only host so `createLayer` / `useLayer` bind during setup. */
export function mountSetup(setup: () => void) {
  const Host = defineComponent({
    setup() {
      setup()
      return () => h('div', { class: 'test-host' })
    },
  })
  const vm = new Vue(Host as never)
  vm.$mount()
  document.body.appendChild(vm.$el)
  return {
    destroy() {
      vm.$destroy()
      vm.$el.remove()
    },
  }
}

export const STUB_ROUTER = {
  currentRoute: { path: '/users' },
} as const

/** Install `$router` on the shared Vue 2 prototype (cleaned up on destroy). */
export function withStubRouter() {
  const proto = Vue.prototype as { $router?: unknown }
  const previous = proto.$router
  proto.$router = STUB_ROUTER
  return {
    restore() {
      if (previous === undefined) delete proto.$router
      else proto.$router = previous
    },
  }
}

export function mountComponent(component: Component) {
  const vm = new Vue(component as never)
  vm.$mount()
  document.body.appendChild(vm.$el)
  return {
    destroy() {
      vm.$destroy()
      vm.$el.remove()
    },
  }
}
