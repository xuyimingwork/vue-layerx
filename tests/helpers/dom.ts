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
