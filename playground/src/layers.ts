import { ElDialog } from 'element-plus'
import { createLayerx } from 'vue-layerx'

export const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})
