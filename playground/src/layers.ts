import { ElDialog, ElDrawer } from 'element-plus'
import { createLayerx } from 'vue-layerx'

/** 通用 Dialog：应用级默认 props */
export const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})

/** 侧边 Drawer：同一套 API，换 layer 即可 */
export const useDrawer = createLayerx(ElDrawer, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    direction: 'rtl',
    size: '360px',
    destroyOnClose: true,
    appendToBody: true,
  },
})

/** 窄确认框：演示 createLayerx.content.props 工厂级默认 */
export const useAlertDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    width: '360px',
    appendToBody: true,
    destroyOnClose: true,
    showClose: false,
  },
  content: {
    props: { tone: 'info' as const },
  },
})
