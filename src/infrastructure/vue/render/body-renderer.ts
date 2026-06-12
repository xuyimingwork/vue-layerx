import { render, type AppContext, type VNode } from 'vue'

export interface BodyRenderer {
  render: (vnode: VNode) => void
  teardown: () => void
}

export function createBodyRenderer(appContext: AppContext | null): BodyRenderer {
  let container: HTMLElement | null = null

  return {
    render(vnode: VNode) {
      if (!container) {
        container = document.createElement('div')
        document.body.appendChild(container)
      }
      if (appContext) vnode.appContext = appContext
      render(vnode, container)
    },
    teardown() {
      if (!container) return
      render(null, container)
      container.remove()
      container = null
    },
  }
}
