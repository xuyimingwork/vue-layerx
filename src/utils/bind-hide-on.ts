import type { LayerProps } from '../types'

export function bindHideOn(
  innerProps: LayerProps,
  events: string[] | undefined,
  hide: () => void,
): LayerProps {
  if (!events?.length) return innerProps
  const listeners: LayerProps = {}
  for (const event of events) {
    const key = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
    const prev = innerProps[key] as ((...args: unknown[]) => unknown) | undefined
    listeners[key] = (...args: unknown[]) => {
      prev?.(...args)
      hide()
    }
  }
  return { ...innerProps, ...listeners }
}
