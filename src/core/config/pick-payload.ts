import type { LayerNodeConfig } from '@/core/types/config'
import type { LayerUsePayload } from '@/core/types/payload'

export function pickContentConfig(
  payload: LayerUsePayload | undefined,
): LayerNodeConfig | undefined {
  if (!payload) return undefined
  const result: LayerNodeConfig = {}
  if (payload.component !== undefined) result.component = payload.component
  if (payload.props !== undefined) result.props = payload.props
  if (payload.slots !== undefined) result.slots = payload.slots
  if (Object.keys(result).length === 0) return undefined
  return result
}

export function pickLayerConfig(
  payload: LayerUsePayload | undefined,
): LayerNodeConfig | undefined {
  return payload?.layer
}
