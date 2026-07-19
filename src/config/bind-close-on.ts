import type { CloseOn, LayerProps } from '@/types/config'

export function bindCloseOn(
  contentProps: LayerProps,
  closeOn: CloseOn | undefined,
  close: () => void,
): LayerProps {
  if (!closeOn?.length) return contentProps
  const listeners: LayerProps = {}
  for (const event of closeOn) {
    const key = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
    const prev = contentProps[key] as ((...args: unknown[]) => unknown) | undefined
    listeners[key] = (...args: unknown[]) => {
      prev?.(...args)
      close()
    }
  }
  return { ...contentProps, ...listeners }
}
