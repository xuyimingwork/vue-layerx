import { ElDialog, ElDrawer } from 'element-plus'
import { createLayerx } from 'vue-layerx'

export const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})

export const useDrawer = createLayerx(ElDrawer, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    direction: 'rtl',
    size: '360px',
    destroyOnClose: true,
    appendToBody: true,
  },
})

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
