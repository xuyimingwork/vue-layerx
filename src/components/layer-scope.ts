import { defineComponent, provide, type PropType } from 'vue'
import type { LayerInstance } from '@/core/types'
import { getInternal } from '@/vue/instance/instance-registry'
import { LAYER_SCOPE_REGISTRY_KEY } from '@/vue/di/injection-keys'

export const LayerScope = defineComponent({
  name: 'LayerScope',
  props: {
    of: {
      type: Object as PropType<LayerInstance>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const internal = getInternal(props.of)

    provide(LAYER_SCOPE_REGISTRY_KEY, {
      registerContentTemplate: internal.registerContentTemplate,
      bumpSlots: internal.bumpSlots,
    })

    return () => slots.default?.()
  },
})
