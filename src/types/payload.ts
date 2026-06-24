import type { LayerNodeConfig } from './config'

/** useX / show / clone — top-level LayerNodeConfig is content */
export type LayerInstanceConfig = LayerNodeConfig & {
  container?: LayerNodeConfig
  hideOn?: string[]
}
