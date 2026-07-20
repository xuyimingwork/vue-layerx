import type { CloseOn, LayerProps } from '@/types/config'

export function bindCloseOn(
  contentProps: LayerProps,
  closeOn: CloseOn | undefined,
  close: () => void,
): LayerProps {
  if (!closeOn || Object.keys(closeOn).length === 0) return contentProps
  const listeners: LayerProps = {}
  for (const [event, entry] of Object.entries(closeOn)) {
    if (entry.when === 'none') continue
    const key = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
    const prev = contentProps[key] as ((...args: unknown[]) => unknown) | undefined
    const { when } = entry
    listeners[key] = (...args: unknown[]) => {
      prev?.(...args)
      if (when === 'always' || when(...args) === true) close()
    }
  }
  return { ...contentProps, ...listeners }
}
