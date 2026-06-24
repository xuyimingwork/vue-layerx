<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/03-edit/App.vue'
import ListSource from '../examples/steps/03-edit/App.vue?raw'
import FormSource from '../examples/tutorial/UserForm.vue?raw'
</script>

# §3 编辑 / 新建

::: info 本章新增
同一工厂，`mode: 'edit' | 'create'` · `closeOn` · footer 保存
:::

**不新增工厂。** `useDetailLayer` 已经包含编辑能力：

```ts
userLayer.open({ props: { mode: 'edit', initialName: row.name, onSubmit: fn } })
userLayer.open({ props: { mode: 'create', onSubmit: fn } })
```

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: ListSource },
    { name: 'UserForm.vue', code: FormSource },
  ]"
/>

`mode !== 'view'` 时表单可编辑，`LayerTemplate name="footer"` 出现保存按钮；`closeOn: ['submit']` 提交后关层。

## 下一步

页内也要保存按钮 → [§4 visible-outside](/guide/visible-outside)
