<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/steps/05-adapt/App.vue'
import PageSource from '../../examples/steps/05-adapt/App.vue?raw'
import LayersSource from '../../.vitepress/shared/layers.ts?raw'
</script>

# §5 useDetailLayer + adapt

::: info 本章新增
少见用法：窄屏把 Dialog 换成 Drawer。日常「统一改配置」见 [用 adapter 统一改配置](/guide/adapter)
:::

详情弹层在窄屏改 Drawer——**还是同一个 `useDetailLayer(UserForm)`**，不用在业务页写 `if (mobile)`。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: PageSource },
    { name: 'layers.ts（detailAdapt）', code: LayersSource },
  ]"
/>

`UserForm` 的 `defineLayer` 同时声明 `width`（Dialog）和 `size`/`direction`（Drawer）；`adapt` 在基础设施层换 `container.component` 并滤 props。

## 下一步

[§6 beforeClose](/guide/cookbook/before-close)
