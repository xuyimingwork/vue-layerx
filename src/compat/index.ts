import { isVue2 } from './env'
import { toValue, type MaybeRefOrGetter } from './polyfill/to-value'
import type { LayerAppHandle, LayerAppState, LayerHost, PlatformRootHandle } from './types'

import * as vue3Platform from './vue3/platform-vnode'
import * as vue2Platform from './vue2/platform-vnode'
import * as vue3Host from './vue3/host'
import * as vue2Host from './vue2/host'
import { createPlatformRoot as createPlatformRootVue3 } from './vue3/create-platform-root'
import { createPlatformRoot as createPlatformRootVue2 } from './vue2/create-platform-root'
import { useLayerViewRender as useLayerViewRenderVue3 } from './vue3/use-layer-view-render'
import { useLayerViewRender as useLayerViewRenderVue2 } from './vue2/use-layer-view-render'

export { isVue2, toValue }
export type { MaybeRefOrGetter, LayerHost, LayerAppHandle, LayerAppState, PlatformRootHandle }

const host = isVue2 ? vue2Host : vue3Host
const platform = isVue2 ? vue2Platform : vue3Platform

export const hasSetupContext = host.hasSetupContext
export const getSetupInstance = host.getSetupInstance

export const DEFAULT_CONTAINER_MODEL = platform.DEFAULT_CONTAINER_MODEL
export const toModelUpdateProp = platform.toModelUpdateProp

export const toPlatformVNodeData = platform.toPlatformVNodeData
export const toPlatformSlots = platform.toPlatformSlots
export const markLayerContent = platform.markLayerContent
export const isLayerContent = platform.isLayerContent

export const createPlatformRoot = isVue2
  ? createPlatformRootVue2
  : createPlatformRootVue3
export const useLayerViewRender = isVue2
  ? useLayerViewRenderVue2
  : useLayerViewRenderVue3
