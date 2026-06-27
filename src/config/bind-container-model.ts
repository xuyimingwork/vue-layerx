import type { LayerProps } from '@/types'

export function bindContainerModel(
  containerProps: LayerProps,
  visible: boolean,
  model: string,
  close: () => void,
): LayerProps {
  const updateEvent = `onUpdate:${model}`
  return {
    ...containerProps,
    [model]: visible,
    [updateEvent]: (value: unknown) => {
      if (value === false || value === undefined) close()
    },
  }
}
