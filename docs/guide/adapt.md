<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/05-adapt/App.vue'
import PageSource from '../examples/steps/05-adapt/App.vue?raw'
import DetailSource from '../examples/tutorial/UserDetail.vue?raw'
import LayersSource from '../.vitepress/shared/layers.ts?raw'
</script>

# §5 useDetailLayer + adapt

::: info 本章新增
**`adapt`** — 按视口动态切换 Dialog / Drawer
:::

`useDetailLayer` 专用于**列表详情**。`UserDetail` 的 `defineLayer` 同时声明 `width`（Dialog）和 `size`/`direction`（Drawer）；**adapt 在基础设施层**决定用哪个壳。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: PageSource },
    { name: 'UserDetail.vue', code: DetailSource },
    { name: 'layers.ts（detailAdapt）', code: LayersSource },
  ]"
/>

## 为什么不用两个工厂

传统做法：

```ts
// 业务页里分支 — 脏
if (isMobile) drawer.show(row)
else dialog.show(row)
```

vue-layerx：

```ts
// 业务页始终一行
detailLayer.show({ props: row })

// layers.ts — adapt 换 component + 滤 props
const detailAdapt: LayerAdapt = (normalized) => {
  if (mobile) {
    return {
      ...normalized,
      layer: {
        ...normalized.layer,
        component: BaseDrawer,
        props: strip(normalized.layer.props, 'width'),
      },
    }
  }
  return { ...normalized, layer: { ...normalized.layer, props: strip(..., 'size', 'direction') } }
}

export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)
```

**UserDetail 一行不改**；切换逻辑收在 `useDetailLayer` 注册处，业务页比传统写法更简单。

## useEditLayer 不需要 adapt

编辑表单通常固定 Dialog；详情只读、轻量，更适合响应式换 Drawer。

## 下一步

[§6 未保存拦截](/guide/before-close)
