import { ref } from 'vue'
import type { LayerAdapter } from 'vue-layerx'
import BaseDialog from '../../examples/shared/BaseDialog.vue'
import BaseDrawer from '../../examples/shared/BaseDrawer.vue'
import { createLayer } from 'vue-layerx'

/** 教程 Demo：模拟窄屏，真实项目里删掉，直接用 matchMedia */
export const detailViewportMobile = ref(false)

function stripProps(props: Record<string, unknown> | undefined, ...keys: string[]) {
  return Object.fromEntries(
    Object.entries(props ?? {}).filter(([key]) => !keys.includes(key)),
  )
}

const detailAdapt: LayerAdapter = (fragment) => {
  const container = fragment.container ?? {}
  const mobile =
    detailViewportMobile.value ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)

  if (!mobile) {
    return {
      ...fragment,
      container: {
        ...container,
        props: stripProps(container.props, 'size', 'direction'),
      },
    }
  }

  return {
    ...fragment,
    container: {
      ...container,
      component: BaseDrawer,
      props: stripProps(container.props, 'width'),
    },
  }
}

/** 详情 / 编辑 / 新建：同一工厂，adapt 负责窄屏换 Drawer */
export const useDetailLayer = createLayer(BaseDialog, { adapter: detailAdapt })
