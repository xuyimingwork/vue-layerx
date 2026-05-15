import { ElDialog } from 'element-plus'
import { createLayers } from 'vue-layerx'

/** 模块级：绑定 Element Plus Dialog 外壳 */
export const useDialog = createLayers(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})
