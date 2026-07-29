import Vue, { defineComponent, h } from 'vue'
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
