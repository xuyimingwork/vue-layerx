import {
  defineComponent,
  getCurrentInstance,
  h,
  onUnmounted,
  provide,
  reactive,
  shallowRef,
  type AppContext,
  type Component,
  type Ref,
} from 'vue'
import { mergeConfig } from '@/domain/config/merge-config'
import { defaultResolve, hasContentComponent } from '@/domain/config/default-resolve'
import { toRenderPlan } from '@/domain/config/to-render-plan'
import type {
  DefineLayerOptions,
  LayerAdapt,
  LayerFactoryDefaults,
  LayerInstance,
  LayerInternalState,
  LayerUsePayload,
} from '@/domain/types'
import {
  attachInternal,
  createLayerInternalState,
} from '@/infrastructure/layer-instance-state'
import { createBodyRenderer } from '@/infrastructure/vue/render/body-renderer'
import { renderLayerTree } from '@/infrastructure/vue/render/render-layer-tree'
import {
  LAYER_DEFINE_KEY,
  LAYER_TEMPLATE_REGISTRY_KEY,
} from '@/infrastructure/vue/di/injection-keys'

export interface UseLayerFactoryContext {
  factoryLayer: Component
  factoryDefaults: LayerFactoryDefaults
  visibleProp: string
  visibleEvent: string
  adapt?: LayerAdapt
}

interface InstanceState {
  visible: boolean
  showOptions: LayerUsePayload
  contentMountKey: number
}

interface CreateInstanceOptions {
  Content?: Component
  useOptions: LayerUsePayload
  partial: LayerUsePayload
  appContext: AppContext | null
}

function buildLayerRoot(
  ctx: UseLayerFactoryContext,
  opts: CreateInstanceOptions,
  internal: LayerInternalState,
  state: InstanceState,
  defineLayerConfig: Ref<DefineLayerOptions | null>,
  hide: () => void,
) {
  return defineComponent({
    name: `LayerRoot_${opts.Content ? (opts.Content as { name?: string }).name ?? 'Anonymous' : 'Shell'}`,
    setup() {
      provide(LAYER_DEFINE_KEY, {
        register(config: DefineLayerOptions) {
          defineLayerConfig.value = config
          internal.bumpSlots()
        },
      })

      provide(LAYER_TEMPLATE_REGISTRY_KEY, {
        registerLayerTemplate: internal.registerLayerTemplate,
        bumpSlots: internal.bumpSlots,
      })

      return () => {
        if (!state.visible) return null
        void internal.slotsVersion.value

        const merged = mergeConfig({
          factoryDefaults: ctx.factoryDefaults,
          defineLayer: defineLayerConfig.value,
          useOptions: opts.useOptions,
          showOptions: state.showOptions,
          partial: opts.partial,
        })

        const resolveCtx = {
          merged,
          factoryLayer: ctx.factoryLayer,
          boundContent: opts.Content,
          layerTemplates: internal.layerTemplates,
          contentTemplates: internal.contentTemplates,
          hide,
        }

        const resolved = defaultResolve(resolveCtx)
        const normalized = ctx.adapt ? ctx.adapt(resolved) : resolved
        const contentPresent = hasContentComponent(resolveCtx)

        const plan = toRenderPlan({
          normalized,
          visible: true,
          visibleProp: ctx.visibleProp,
          visibleEvent: ctx.visibleEvent,
          onHide: hide,
        })

        if (contentPresent) {
          plan.content.props = {
            ...plan.content.props,
            __layerContentKey: state.contentMountKey,
          }
        }

        return renderLayerTree(plan, contentPresent)
      }
    },
  })
}

function createInstance(ctx: UseLayerFactoryContext, opts: CreateInstanceOptions): LayerInstance {
  const bodyRenderer = createBodyRenderer(opts.appContext)
  const internal = createLayerInternalState()
  const state = reactive<InstanceState>({
    visible: false,
    showOptions: {},
    contentMountKey: 0,
  })
  const defineLayerConfig = shallowRef<DefineLayerOptions | null>(null)

  const hide = () => {
    state.visible = false
    bodyRenderer.teardown()
  }

  const LayerRoot = buildLayerRoot(ctx, opts, internal, state, defineLayerConfig, hide)

  const show = (payload?: LayerUsePayload) => {
    defineLayerConfig.value = null
    if (payload) state.showOptions = payload
    state.contentMountKey++
    state.visible = true
    bodyRenderer.render(h(LayerRoot))
  }

  const instance: LayerInstance = {
    show,
    hide,
    clone(partial?: LayerUsePayload) {
      return createInstance(ctx, {
        Content: opts.Content,
        useOptions: opts.useOptions,
        partial: partial ?? {},
        appContext: opts.appContext,
      })
    },
    get visible() {
      return state.visible
    },
  }

  attachInternal(instance, internal)
  return instance
}

export function createUseLayer(ctx: UseLayerFactoryContext) {
  return function useLayer(
    Content?: Component,
    useOptions: LayerUsePayload = {},
  ): LayerInstance {
    const hostInstance = getCurrentInstance()
    const appContext = hostInstance?.appContext ?? null

    const instance = createInstance(ctx, {
      Content,
      useOptions,
      partial: {},
      appContext,
    })

    if (hostInstance) {
      onUnmounted(() => instance.hide())
    }

    return instance
  }
}
