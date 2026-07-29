import { createLayer } from 'vue-layerx'
import MyDialog from './MyDialog.vue'

/** 本 demo 专用：壳内自带「关闭」，业务按钮走 actions 插槽 */
export const useMyDialog = createLayer(MyDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
    draggable: true,
  },
})
