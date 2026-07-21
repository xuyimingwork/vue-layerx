# 按环境换容器

有时同一套业务，宽屏用 Dialog、窄屏用 Drawer。  
你可以在 `createLayer` 上挂一个 `adapter` 函数：在配置合并之后、真正渲染之前，改掉容器组件、删掉对方不认识的 props、对齐插槽名等。

业务页仍然只写一行 `userLayer.open(...)`，不必自己 `if (mobile)`。

## 何时需要

- 窄屏 Dialog → Drawer / Popup  
- Dialog 的 `#title` 和 Drawer 的 `#header` 等名字不一致  
- 目标容器不支持某些 props（例如 Drawer 没有 `width`）

## 写法示例

```ts
import type { LayerAdapter } from 'vue-layerx'
import { ElDialog, ElDrawer } from 'element-plus'

const adapt: LayerAdapter = (fragment) => {
  if (!isNarrow()) return fragment
  const props = { ...fragment.container?.props }
  delete props.width
  return {
    ...fragment,
    container: {
      ...fragment.container,
      component: ElDrawer,
      props,
    },
  }
}

export const useDetailLayer = createLayer(ElDialog, { adapter: adapt })
```

`adapter` 跟这个组合式函数绑定：用 `useDetailLayer` 打开的实例，都会走上面的逻辑。

## 和 open 里换容器的关系

你也可以在 `open` / 创建实例时指定 `container.component`，但最终仍会先合并配置，再跑 `adapter`。`adapter` 可以再次改掉容器。

业务向完整例子见 [实践教程 §5](/guide/cookbook/adapt)。

## 下一步

[实例的更多能力](/guide/instance)
