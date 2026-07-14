import type { LayerProps } from '@/types'

export const DEFAULT_CONTAINER_MODEL = 'modelValue' as const

export function bindContainerModel(
  containerProps: LayerProps,
  visible: boolean,
  model: string,
  close: () => void,
): LayerProps {
  const updateEvent = `onUpdate:${model}`
  const prev = containerProps[updateEvent] as ((value: unknown) => unknown) | undefined
  return {
    ...containerProps,
    [model]: visible,
    [updateEvent]: (value: unknown) => {
      prev?.(value)
      if (value === false || value === undefined) close()
    },
  }
}
