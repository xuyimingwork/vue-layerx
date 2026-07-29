import * as Vue from 'vue'
import type { Component } from 'vue'
import type { LayerHost, PlatformRootHandle } from '@/compat/types'
import { getSetupInstance } from './setup-instance'

export type { PlatformRootHandle }

const { createApp } = Vue

type Vue3Host = {
  appContext: object
  provides: Record<string | symbol, unknown>
}

function bridgeHost(instance: Vue3Host, host: Vue3Host | null) {
  if (!host) return

  const appContext = Object.create(host.appContext) as Vue3Host['appContext'] & {
    app: unknown
    provides: Record<string | symbol, unknown>
  }
  appContext.app = (instance.appContext as { app?: unknown }).app
  appContext.provides = Object.create(host.provides)
  instance.appContext = appContext
  instance.provides = Object.create(host.provides)
}

/**
 * Vue 3: `createApp(root)`. Host bridging runs in `setup()` (call from root setup).
 */
export function createPlatformRoot({
  root,
  host,
}: {
  root: Component
  host: LayerHost | null
}): PlatformRootHandle {
  let app: { mount: (el: Element) => void; unmount: () => void } | null = null

  return {
    host,
    setup() {
      bridgeHost(
        getSetupInstance() as unknown as Vue3Host,
        host as Vue3Host | null,
      )
    },
    mount(el) {
      if (app) return
      app = createApp!(root)
      app.mount(el)
    },
    unmount() {
      if (!app) return
      app.unmount()
      app = null
    },
  }
}
