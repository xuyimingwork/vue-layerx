import { ElDialog } from 'element-plus'
import { createLayer } from 'vue-layerx'

export const useDialog = createLayer(ElDialog, {
  props: {
    appendToBody: true,
    destroyOnClose: true,
  },
})
