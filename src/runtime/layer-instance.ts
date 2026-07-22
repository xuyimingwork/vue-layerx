import {
  computed,
  getCurrentInstance,
  onUnmounted,
  reactive,
  shallowRef,
  toValue,
  type ComponentPublicInstance,
  type ComputedRef,
  type MaybeRefOrGetter,
} from 'vue'
import type {
  LayerConfigFragment,
  LayerConfigFragmentCreate,
  LayerInstance,
  LayerConfigContent,
  LayerInstanceStoreInit,
  LayerInstanceStoreWithTemplate,
  LayerCloseOptions,
  LayerClosePayload,
  LayerConfirmResult,
} from '@/types'
import {
  toFragmentFromContent,
  mergeFragment,
  stripFragment,
} from '@/config/fragment'
import { renderless, withTemplateTo } from '@/shared/layer-template-to'
import { createLayerStore } from '@/shared/layer-store'
import { createLayerApp } from '@/runtime/layer-app'
import { LayerConfirmError } from '@/shared/layer-confirm-error'
import { warn } from '@/shared/warn'
import type { LayerHost } from '@/types/layer-host'

type Confirming = {
  resolve: (result: LayerConfirmResult) => void
  reject: (error: LayerConfirmError) => void
}

export function createLayerInstance({
  create,
  use,
}: {
  create: ComputedRef<LayerConfigFragmentCreate>
  use: ComputedRef<LayerConfigFragment>
}): LayerInstance {
  const containerEl = shallowRef<ComponentPublicInstance | null>(null)
  const contentEl = shallowRef<ComponentPublicInstance | null>(null)
  const store = createLayerInstanceStore({
    create,
    use,
    refs: {
      container: {
        props: {
          ref: (el: ComponentPublicInstance | null) => {
            containerEl.value = el
          },
        },
      },
      content: {
        props: {
          ref: (el: ComponentPublicInstance | null) => {
            contentEl.value = el
          },
        },
      },
    } as LayerConfigFragment,
  })
  const state = reactive({
    visible: false,
  })
  const host = shallowRef<LayerHost | null>(null)
  let confirming: Confirming | null = null

  const open = (config?: LayerConfigContent) => {
    store.open = toFragmentFromContent(config)
    state.visible = true
  }

  const close = (payload: LayerClosePayload = {}) => {
    if (confirming) {
      const args = payload.args ?? []
      const result: LayerConfirmResult = {
        source: payload.source!,
        event: payload.event,
        args,
        data: args[0],
      }
      if (payload.confirmed === true) confirming.resolve(result)
      else confirming.reject(new LayerConfirmError({ code: 'close', result }))
      confirming = null
    }
    state.visible = false
  }

  const app = createLayerApp({ store, state, host, close })

  const dispose = () => {
    close({ source: 'unmount' })
    app.unmount()
  }

  const confirm = (config?: LayerConfigContent) => {
    if (confirming || state.visible) {
      return Promise.reject(new LayerConfirmError({ code: 'busy' }))
    }
    return new Promise<LayerConfirmResult>((resolve, reject) => {
      confirming = { resolve, reject }
      open(config)
    })
  }

  const bindHost = ({ silent = false } = {}) => {
    const current = getCurrentInstance()

    if (host.value) {
      if (!silent && current && current !== host.value) {
        warn('bindHost() ignored: already bound to another host')
      }
      return
    }

    if (!current || current.isMounted) {
      if (!silent) {
        warn('bindHost() must be called synchronously during setup')
      }
      return
    }

    host.value = current as LayerHost
    onUnmounted(() => {
      host.value = null
      dispose()
    })
  }

  const instance: LayerInstance = {
    open(config) {
      if (confirming) {
        warn('open() ignored: confirm() is pending')
        return
      }
      open(config)
    },
    confirm,
    close(options?: LayerCloseOptions) {
      close({ ...options, source: 'instance' })
    },
    unmount: dispose,
    bindHost,
    get content() {
      return state.visible ? contentEl.value : null
    },
    get container() {
      return state.visible ? containerEl.value : null
    },
    clone(config: MaybeRefOrGetter<LayerConfigContent> = {}) {
      return createLayerInstance({
        create,
        use: computed(() =>
          mergeFragment(
            stripFragment(use.value, (path) => path.endsWith('.props.ref')),
            toFragmentFromContent(toValue(config)),
          ),
        ),
      })
    },
    get visible() {
      return state.visible
    },
  }

  bindHost({ silent: true })

  return withTemplateTo(instance, {
    template({ name, container, render }) {
      const dispose = store.template({
        key: container ? 'use:template.container' : 'use:template.content',
        name,
        entry: {
          render: (slotProps: Record<string, unknown> = {}) => render(slotProps),
        },
      })
      return { render: renderless, dispose }
    },
  })
}

export function createLayerInstanceStore(
  init: LayerInstanceStoreInit,
): LayerInstanceStoreWithTemplate {
  return createLayerStore({
    create: init.create,
    use: init.use,
    'use:template': {},
    open: {},
    refs: init.refs,
  })
}
