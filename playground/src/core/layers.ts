import { ElDialog, ElDrawer } from 'element-plus'
import { createLayer } from 'vue-layerx'

export const useDialog = createLayer(
  ElDialog,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    layer: {
      props: {
        width: '480px',
        destroyOnClose: true,
        appendToBody: true,
      },
    },
  },
  (normalized) => ({
    ...normalized,
    layer: {
      ...normalized.layer,
      props: Object.fromEntries(
        Object.entries(normalized.layer.props).filter(([key]) => key !== 'direction'),
      ),
    },
  }),
)

export const useDrawer = createLayer(
  ElDrawer,
  {
    visible: ['modelValue', 'onUpdate:modelValue'],
    layer: {
      props: {
        direction: 'rtl',
        size: '360px',
        destroyOnClose: true,
        appendToBody: true,
      },
    },
  },
  (normalized) => {
    const { title, footer, ...rest } = normalized.layer.slots
    return {
      ...normalized,
      layer: {
        ...normalized.layer,
        props: Object.fromEntries(
          Object.entries(normalized.layer.props).filter(([key]) => key !== 'width'),
        ),
        slots: {
          ...rest,
          ...(title ? { header: title } : {}),
          ...(footer ? { footer } : {}),
        },
      },
    }
  },
)

export const useAlertDialog = createLayer(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  layer: {
    props: {
      width: '360px',
      appendToBody: true,
      destroyOnClose: true,
      showClose: false,
    },
  },
  content: {
    props: { tone: 'info' as const },
  },
})
