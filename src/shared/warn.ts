/** Dev-only warning; no-op in production. */
export function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return
  console.warn(`[vue-layerx] ${message}`)
}
