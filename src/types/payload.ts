import type { LayerConfigNode } from './config'

/** useX / show / clone — top-level LayerConfigNode is content */
export type LayerInstanceConfig = LayerConfigNode & {
  container?: LayerConfigNode
  hideOn?: string[]
}
