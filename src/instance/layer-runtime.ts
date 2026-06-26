import { h, render, type Component, type ComponentInternalInstance } from 'vue'

export interface LayerRuntime {
  readonly mounted: boolean
  mount: () => void
  unmount: () => void
}

export type GetViewHost = () => ComponentInternalInstance | null

export function createLayerRuntime(view: Component, getViewHost: GetViewHost): LayerRuntime {
  let container: HTMLElement | null = null

  return {
    get mounted() {
      return container !== null
    },
    mount() {
      if (!container) {
        container = document.createElement('div')
        document.body.appendChild(container)
      }
      const vnode = h(view)
      const host = getViewHost()
      if (host && !host.isUnmounted) {
        vnode.appContext = host.appContext
      }
      render(vnode, container)
    },
    unmount() {
      if (!container) return
      render(null, container)
      container.remove()
      container = null
    },
  }
}
