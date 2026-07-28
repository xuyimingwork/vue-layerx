import { isVue2 } from './env'
import { toValue, type MaybeRefOrGetter } from './polyfill/to-value'
import type {
  CreateLayerViewVNodeOptions,
  LayerAppHandle,
  LayerAppState,
  LayerHost,
} from './types'

import * as vue3Model from './vue3/model'
import * as vue2Model from './vue2/model'
import * as vue3Platform from './vue3/platform-vnode'
import * as vue2Platform from './vue2/platform-vnode'
import * as vue3Host from './vue3/host'
import * as vue2Host from './vue2/host'
import { createLayerApp as createLayerAppVue3 } from './vue3/create-layer-app'
import { createLayerApp as createLayerAppVue2 } from './vue2/create-layer-app'
import { createLayerViewVNode as createLayerViewVNodeVue3 } from './vue3/create-layer-view-vnode'
import { createLayerViewVNode as createLayerViewVNodeVue2 } from './vue2/create-layer-view-vnode'
import { useContentPlacement as useContentPlacementVue3 } from './vue3/content-placement'
import { useContentPlacement as useContentPlacementVue2 } from './vue2/content-placement'

export { isVue2, toValue }
export type {
  MaybeRefOrGetter,
  LayerHost,
  LayerAppHandle,
  LayerAppState,
  CreateLayerViewVNodeOptions,
}

const host = isVue2 ? vue2Host : vue3Host
const model = isVue2 ? vue2Model : vue3Model
const platform = isVue2 ? vue2Platform : vue3Platform

export const hasSetupContext = host.hasSetupContext
export const getSetupInstance = host.getSetupInstance

export const DEFAULT_CONTAINER_MODEL = model.DEFAULT_CONTAINER_MODEL
export const toModelUpdateProp = model.toModelUpdateProp

export const toPlatformVNodeData = platform.toPlatformVNodeData
export const toPlatformSlots = platform.toPlatformSlots
export const markLayerContent = platform.markLayerContent
export const isLayerContent = platform.isLayerContent

export const createLayerApp = isVue2 ? createLayerAppVue2 : createLayerAppVue3
export const createLayerViewVNode = isVue2
  ? createLayerViewVNodeVue2
  : createLayerViewVNodeVue3
export const useContentPlacement = isVue2
  ? useContentPlacementVue2
  : useContentPlacementVue3
