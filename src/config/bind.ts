import type { CloseOn, LayerConfigFragment, LayerProps } from '@/types/config'
import type { LayerBound } from '@/types/bound'
import type { LayerClosePayload } from '@/types/confirm'
import { DEFAULT_CONTAINER_MODEL, toModelUpdateProp } from '@/compat'

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
      try {
        prev?.(...args)
      } finally {
        const value = args[0]
        if (value === false || value === undefined) {
          close({
            source: 'container',
            event,
            args,
          })
        }
      }
    },
  }
}

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
      try {
        prev?.(...args)
      } finally {
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
  }
  return { ...contentProps, ...listeners }
}

export function bindLayer(ctx: {
  fragment: LayerConfigFragment
  visible: boolean
  close: (payload?: LayerClosePayload) => void
}): LayerBound {
  const { fragment, visible, close } = ctx
  const container = fragment.container ?? {}
  const content = fragment.content ?? {}

  const containerComponent = container.component
  if (!containerComponent) return {}

  const contentComponent = content.component
  const model = container.model ?? DEFAULT_CONTAINER_MODEL

  const containerBound = {
    component: containerComponent,
    props: bindContainerModel(container.props ?? {}, visible, model, close),
    slots: container.slots ?? {},
  }

  if (!contentComponent) {
    return { container: containerBound }
  }

  const contentProps = bindCloseOn(content.props ?? {}, content.closeOn, close)

  return {
    container: containerBound,
    content: {
      component: contentComponent,
      props: contentProps,
      slots: content.slots ?? {},
    },
  }
}
