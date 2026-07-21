# adapter

`adapter` 挂在 `createLayer` 上，在 merge 之后对 **Canonical fragment** 做整形：换容器组件、滤 props、搬 slot key、改 `model` 等。

## 何时需要

- 窄屏把 Dialog 换成 Drawer / Popup  
- Dialog 的 `#title` 与 Drawer 的 `#header` 等 slot 名对齐  
- 去掉目标壳不认识的 props（如 Drawer 没有 `width`）

## 写法

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

实例由哪个工厂创建，就跑**该工厂**注册的那一个 adapter；`open` 不会跳过 adapter。

## 与 open 覆盖的关系

`open` / `use` 可以覆盖 `container.component`，但仍先 merge 再跑 adapter。adapter 可以改回或再次替换容器。

业务向示例见 [实践：adapt](/guide/cookbook/adapt)。

## 下一步

[实例进阶](/guide/instance)
