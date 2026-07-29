import type { LayerProps } from '@/types'
import type { LayerClosePayload } from '@/types/confirm'
import { toModelUpdateProp } from '@/compat'

/** `onUpdate:x` → `update:x`; `onInput` → `input` (strip `on`, lower first letter). */
function toEvent(flatProp: string): string {
  return flatProp[2]!.toLowerCase() + flatProp.slice(3)
}

export function bindContainerModel(
  containerProps: LayerProps,
  visible: boolean,
  model: string,
  close: (payload?: LayerClosePayload) => void,
): LayerProps {
  const updateEvent = toModelUpdateProp(model)
  const event = toEvent(updateEvent)
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
