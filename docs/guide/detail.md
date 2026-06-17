<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/01-detail/App.vue'
import ListSource from '../examples/steps/01-detail/App.vue?raw'
import DetailSource from '../examples/tutorial/UserDetail.vue?raw'
import LayersSource from '../.vitepress/shared/layers.ts?raw'
</script>

# §1 列表详情弹层

::: info 本章新增
`UserDetail` · `useDetailLayer` · `defineLayer` · `show({ props })`
:::

列表点姓名 → 弹出详情。列表页**零** dialog 模板。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: ListSource },
    { name: 'UserDetail.vue', code: DetailSource },
    { name: 'layers.ts → useDetailLayer', code: LayersSource },
  ]"
/>

## UserDetail.vue

纯展示组件，名字**不带 Dialog**：

```ts
defineLayer({
  props: { title: '用户详情', width: '420px', size: '85vw', direction: 'rtl' },
})
```

- `defineLayer` 声明弹层时的标题和尺寸
- 无 footer 按钮——关闭走 BaseDialog 的「关闭」
- 此时**不需要** `visible-outside`（页内详情只是 Descriptions，没有「保存」）

## UserList.vue

```ts
const detailLayer = useDetailLayer(UserDetail)
detailLayer.show({ props: row })
```

## 下一步

同一 `UserDetail` 嵌进订单页：[§2 OrderDetail 组合](/guide/compose)
