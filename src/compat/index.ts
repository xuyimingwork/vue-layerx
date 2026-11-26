import { isVue2 } from './env'
import { toValue, type MaybeRefOrGetter } from './polyfill/to-value'
import { set, del } from './polyfill/set'
import type { LayerHost, PlatformRootHandle } from './types'

import * as vue3Platform from './vue3/platform'
import * as vue2Platform from './vue2/platform'
import * as vue3Setup from './vue3/setup-instance'
import * as vue2Setup from './vue2/setup-instance'
import { createPlatformRoot as createPlatformRootVue3 } from './vue3/create-platform-root'
import { createPlatformRoot as createPlatformRootVue2 } from './vue2/create-platform-root'
import { useLayerViewRender as useLayerViewRenderVue3 } from './vue3/use-layer-view-render'
import { useLayerViewRender as useLayerViewRenderVue2 } from './vue2/use-layer-view-render'

export { isVue2, toValue, set, del }
export type { MaybeRefOrGetter, LayerHost, PlatformRootHandle }

function compat<V2, V3>(v2: V2, v3: V3): V2 | V3 {
  if (isVue2) return v2
  return v3
}

const setup = compat(vue2Setup, vue3Setup)
const platform = compat(vue2Platform, vue3Platform)

export const hasSetupContext = setup.hasSetupContext
export const getSetupInstance = setup.getSetupInstance

export const DEFAULT_CONTAINER_MODEL = platform.DEFAULT_CONTAINER_MODEL
export const toModelUpdateProp = platform.toModelUpdateProp

export const h = platform.h
export const toComponentRoot = platform.toComponentRoot
export const toPlatformVNodeData = platform.toPlatformVNodeData
export const toPlatformSlots = platform.toPlatformSlots
export const markLayerContent = platform.markLayerContent
export const isLayerContent = platform.isLayerContent

export const createPlatformRoot = compat(createPlatformRootVue2, createPlatformRootVue3)
export const useLayerViewRender = compat(useLayerViewRenderVue2, useLayerViewRenderVue3)
