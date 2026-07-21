<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/steps/01-detail/App.vue'
import ListSource from '../../examples/steps/01-detail/App.vue?raw'
import FormSource from '../../examples/tutorial/UserForm.vue?raw'
</script>

# §1 列表详情弹层

::: info 本章新增
`useDetailLayer(UserForm)` · `mode: 'view'` · disabled 表单
:::

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: ListSource },
    { name: 'UserForm.vue', code: FormSource },
  ]"
/>

```ts
const userLayer = useDetailLayer(UserForm)

userLayer.open({
  props: { mode: 'view', recordId: row.id, initialName: row.name, ... },
})
```

- `mode: 'view'` → 输入框 **disabled**，无 footer 保存按钮
- 关闭走 BaseDialog「关闭」
- 此时还不需要 `visible-outside`

## 下一步

[§2 OrderDetail 嵌入](/guide/cookbook/compose)
