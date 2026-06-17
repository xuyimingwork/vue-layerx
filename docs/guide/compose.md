<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/02-compose/App.vue'
import OrderSource from '../examples/tutorial/OrderDetail.vue?raw'
import DetailSource from '../examples/tutorial/UserDetail.vue?raw'
</script>

# §2 OrderDetail 组合

::: info 本章新增
**组合性** — 内容组件不依赖弹层
:::

订单页展示收货人——**只读 `<UserDetail />`**，不是编辑表单。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'OrderDetail.vue', code: OrderSource },
    { name: 'UserDetail.vue', code: DetailSource },
  ]"
/>

## 对比

```vue
<!-- OrderDetail.vue -->
<UserDetail :name="order.userName" :email="order.email" :role="order.role" />
```

没有 `useDetailLayer`，没有 `show()`。`defineLayer` 在页内不渲染成弹层，**不妨碍**当普通组件用。

这就是 `defineLayer` 写在 `UserDetail` 而不是 `UserDetailDialog` 的原因：同一份代码，列表弹层 + 订单嵌入。

## 下一步

列表还要新建/编辑：[§3 编辑表单](/guide/edit)
