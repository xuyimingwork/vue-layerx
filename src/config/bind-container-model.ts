import type { LayerProps } from '@/types'
import type { LayerClosePayload } from '@/types/confirm'

export const DEFAULT_CONTAINER_MODEL = 'modelValue' as const

export function bindContainerModel(
  containerProps: LayerProps,
  visible: boolean,
  model: string,
  close: (payload?: LayerClosePayload) => void,
): LayerProps {
  const updateEvent = `onUpdate:${model}`
  const event = `update:${model}`
  const prev = containerProps[updateEvent] as
    | ((...args: unknown[]) => unknown)
    | undefined
  return {
    ...containerProps,
    [model]: visible,
    [updateEvent]: (...args: unknown[]) => {
      prev?.(...args)
      const value = args[0]
      if (value === false || value === undefined) {
        close({
          source: 'container',
          event,
          args,
        })
      }
    },
  }
}
