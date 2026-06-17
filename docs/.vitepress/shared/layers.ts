import { ref } from 'vue'
import type { LayerAdapt } from 'vue-layerx'
import BaseDialog from '../../examples/shared/BaseDialog.vue'
import BaseDrawer from '../../examples/shared/BaseDrawer.vue'
import { createLayer } from 'vue-layerx'

/** 教程 Demo：模拟窄屏，真实项目里删掉，直接用 matchMedia */
export const detailViewportMobile = ref(false)

function stripProps(props: Record<string, unknown>, ...keys: string[]) {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !keys.includes(key)))
}

const detailAdapt: LayerAdapt = (normalized) => {
  const mobile =
    detailViewportMobile.value ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)

  if (!mobile) {
    return {
      ...normalized,
      layer: {
        ...normalized.layer,
        props: stripProps(normalized.layer.props, 'size', 'direction'),
      },
    }
  }

  return {
    ...normalized,
    layer: {
      ...normalized.layer,
      component: BaseDrawer,
      props: stripProps(normalized.layer.props, 'width'),
    },
  }
}

/** 列表详情：Dialog ↔ Drawer 由 adapt 按视口切换 */
export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)

/** 新建/编辑：默认 Dialog，配置全在 BaseDialog 里 */
export const useEditLayer = createLayer(BaseDialog)
