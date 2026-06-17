<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/03-edit/App.vue'
import ListSource from '../examples/steps/03-edit/App.vue?raw'
import FormSource from '../examples/tutorial/UserForm.vue?raw'
</script>

# §3 编辑表单

::: info 本章新增
`UserForm` · `useEditLayer` · `hideOn` · `LayerTemplate` 主操作
:::

详情（UserDetail）和编辑（UserForm）**分开**。编辑弹层走 `useEditLayer`，配置仍比传统写法短。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'UserList.vue', code: ListSource },
    { name: 'UserForm.vue', code: FormSource },
  ]"
/>

## UserForm.vue

```ts
defineLayer({
  props: { title: props.mode === 'edit' ? '编辑用户' : '新建用户' },
  hideOn: ['submit'],
})
```

```vue
<LayerTemplate name="footer">
  <ElButton type="primary" @click="handleSubmit">保存</ElButton>
</LayerTemplate>
```

- **关闭** → BaseDialog「关闭」
- **保存成功** → `hideOn: ['submit']`
- 此时**没有** `visible-outside`——表单只设计给弹层用

## useEditLayer

```ts
export const useEditLayer = createLayer(BaseDialog)
```

第二个参数省略；默认全在 BaseDialog。

## 下一步

设置页也想页内编辑，但保存按钮只在弹层里：[§4 visible-outside](/guide/visible-outside)
