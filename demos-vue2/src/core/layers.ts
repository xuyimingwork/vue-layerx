import { Dialog } from 'element-ui'
import { createLayer } from 'vue-layerx'

/** Element UI Dialog uses `visible` / `update:visible`, not Vue 2 default `value`. */
export const useDialog = createLayer(Dialog, {
  model: 'visible',
  props: {
    width: '480px',
    appendToBody: true,
    closeOnClickModal: true,
  },
})
