import { defineComponent, provide, type PropType } from 'vue'
import type { LayerInstance } from '@/core/types'
import { getInternal } from '@/vue/instance/instance-registry'
import { LAYER_BIND_REGISTRY_KEY } from '@/vue/di/injection-keys'

export const LayerBind = defineComponent({
  name: 'LayerBind',
  props: {
    to: {
      type: Object as PropType<LayerInstance>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const internal = getInternal(props.to)

    provide(LAYER_BIND_REGISTRY_KEY, {
      registerContentTemplate: internal.registerContentTemplate,
    })

    return () => slots.default?.()
  },
})
