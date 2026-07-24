<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/content-reuse/App.vue'
import AppSource from '../../examples/content-reuse/App.vue?raw'
import PanelSource from '../../examples/content-reuse/FilterPanel.vue?raw'
import LayersSource from '../../examples/shared/layers.ts?raw'
</script>

# 复用内容组件

同一份 `FilterPanel`：嵌在页面里改筛选，也可以用 Dialog 或 Drawer 打开。内容只维护一份；`defineLayer` 同时声明 `width`（Dialog）与 `direction`（Drawer），工厂 `adapter` 各自滤掉无关 props。

页内也要操作区时，给 `LayerTemplate` 加 `visible-outside`，并用 `layer.exists` 区分形态。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'FilterPanel.vue', code: PanelSource },
    { name: 'layers.ts', code: LayersSource },
  ]"
/>

```ts
const filterDialog = useDialog(FilterPanel)
const filterDrawer = useDrawer(FilterPanel)
// 页内：<FilterPanel @apply="…" />
```

按屏宽在一个工厂里自动换容器，见[用 adapter 统一改配置](/guide/adapter)。
