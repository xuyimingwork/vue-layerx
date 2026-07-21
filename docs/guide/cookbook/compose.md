<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/steps/02-compose/App.vue'
import OrderSource from '../../examples/tutorial/OrderDetail.vue?raw'
import FormSource from '../../examples/tutorial/UserForm.vue?raw'
</script>

# §2 OrderDetail 嵌入

::: info 本章新增
同一 `UserForm`，页内 `mode="view"`
:::

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'OrderDetail.vue', code: OrderSource },
    { name: 'UserForm.vue', code: FormSource },
  ]"
/>

```vue
<UserForm
  mode="view"
  :initial-name="order.userName"
  :email="order.email"
  :role="order.role"
/>
```

`defineLayer` 在页内不触发弹层；就是一份 disabled 表单。**不用**再写 Descriptions  duplicate。

## 下一步

[§3 编辑 / 新建](/guide/cookbook/edit) — 仍是 `useDetailLayer`，改 `mode` 即可
