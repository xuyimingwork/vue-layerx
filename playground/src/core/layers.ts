import { ElDialog, ElDrawer } from 'element-plus'
import { createLayer } from 'vue-layerx'

export const useDialog = createLayer(ElDialog, {
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
  adapter: (fragment) => ({
    ...fragment,
    container: {
      ...fragment.container,
      props: Object.fromEntries(
        Object.entries(fragment.container?.props ?? {}).filter(([key]) => key !== 'direction'),
      ),
    },
  }),
})

export const useDrawer = createLayer(ElDrawer, {
  props: {
    direction: 'rtl',
    size: '360px',
    destroyOnClose: true,
    appendToBody: true,
  },
  adapter: (fragment) => {
    const container = fragment.container ?? {}
    const { title, footer, ...rest } = container.slots ?? {}
    return {
      ...fragment,
      container: {
        ...container,
        props: Object.fromEntries(
          Object.entries(container.props ?? {}).filter(([key]) => key !== 'width'),
        ),
        slots: {
          ...rest,
          ...(title ? { header: title } : {}),
          ...(footer ? { footer } : {}),
        },
      },
    }
  },
})

export const useAlertDialog = createLayer(ElDialog, {
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
