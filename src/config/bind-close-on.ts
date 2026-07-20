import type { CloseOn, LayerProps } from '@/types/config'
import type { LayerClosePayload } from '@/types/confirm'

export function bindCloseOn(
  contentProps: LayerProps,
  closeOn: CloseOn | undefined,
  close: (payload?: LayerClosePayload) => void,
): LayerProps {
  if (!closeOn || Object.keys(closeOn).length === 0) return contentProps
  const listeners: LayerProps = {}
  for (const [event, entry] of Object.entries(closeOn)) {
    if (entry.when === 'none') continue
    const key = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
    const prev = contentProps[key] as ((...args: unknown[]) => unknown) | undefined
    const { when, confirmed } = entry
    listeners[key] = (...args: unknown[]) => {
      prev?.(...args)
      if (when === 'always' || when(...args) === true) {
        close({
          confirmed,
          source: 'content',
          event,
          args,
        })
      }
    }
  }
  return { ...contentProps, ...listeners }
}
