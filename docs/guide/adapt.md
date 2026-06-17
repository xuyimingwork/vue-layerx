<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/05-adapt/App.vue'
import PageSource from '../examples/steps/05-adapt/App.vue?raw'
import LayersSource from '../.vitepress/shared/layers.ts?raw'
</script>

# §5 useDetailLayer + adapt

::: info 本章新增
`adapt` — 窄屏 Dialog → Drawer，业务页仍 `userLayer.show(...)` 一行
:::

详情弹层在窄屏改 Drawer——**还是同一个 `useDetailLayer(UserForm)`**，不用在业务页写 `if (mobile)`。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: PageSource },
    { name: 'layers.ts（detailAdapt）', code: LayersSource },
  ]"
/>

`UserForm` 的 `defineLayer` 同时声明 `width`（Dialog）和 `size`/`direction`（Drawer）；`adapt` 在基础设施层换 `layer.component` 并滤 props。

## 下一步

[§6 beforeClose](/guide/before-close)
