import { createLayer } from 'vue-layerx'
import BaseDialog from './BaseDialog.vue'
import BaseDrawer from './BaseDrawer.vue'

export const useDialog = createLayer(BaseDialog, {
  props: { width: '480px' },
})

export const useDrawer = createLayer(BaseDrawer)
