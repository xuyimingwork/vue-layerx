import { ElDialog } from 'element-plus'
import { createLayerx } from 'vue-layerx'

/** 模块级：绑定 Element Plus Dialog 外壳 */
export const useDialog = createLayerx(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})
