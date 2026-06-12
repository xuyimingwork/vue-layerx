import type { LayerProps } from '../types'

export function bindHideOn(
  contentProps: LayerProps,
  events: string[] | undefined,
  hide: () => void,
): LayerProps {
  if (!events?.length) return contentProps
  const listeners: LayerProps = {}
  for (const event of events) {
    const key = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
    const prev = contentProps[key] as ((...args: unknown[]) => unknown) | undefined
    listeners[key] = (...args: unknown[]) => {
      prev?.(...args)
      hide()
    }
  }
  return { ...contentProps, ...listeners }
}
