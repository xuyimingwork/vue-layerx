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
