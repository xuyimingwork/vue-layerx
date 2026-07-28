export const DEFAULT_CONTAINER_MODEL = 'modelValue' as const

/** Flat listener prop for container v-model (Vue 3): `onUpdate:${model}`. */
export function toModelUpdateProp(model: string): string {
  return `onUpdate:${model}`
}
