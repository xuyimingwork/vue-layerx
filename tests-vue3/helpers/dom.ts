import { type Component } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
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

/** Stub app-level `$router` the way App / vue-router installs globalProperties. */
export const STUB_ROUTER = {
  currentRoute: { path: '/users' },
} as const

export function mountWithRouter(component: Component): VueWrapper {
  return mount(component, {
    global: {
      config: {
        globalProperties: {
          $router: STUB_ROUTER,
        },
      },
    },
  })
}
