import type { LayerProps } from '@/types'

export function buildVisibleProps(
  layerProps: LayerProps,
  visible: boolean,
  visibleProp: string,
  visibleEvent: string,
  hide: () => void,
): LayerProps {
  return {
    ...layerProps,
    [visibleProp]: visible,
    [visibleEvent]: (value: unknown) => {
      if (value === false || value === undefined) hide()
    },
  }
}
