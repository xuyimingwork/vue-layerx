<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/steps/03-edit/App.vue'
import FormSource from '../examples/tutorial/UserForm.vue?raw'
</script>

# §6 未保存拦截

::: info 本章新增
`defineLayer.props.beforeClose`
:::

编辑表单的关闭语义仍在 **UserForm** 的 `defineLayer` 里：

```ts
defineLayer({
  props: {
    beforeClose: (done) => {
      if (!dirty.value) { done(); return }
      if (confirm('未保存，确定关闭？')) done()
    },
  },
  hideOn: ['submit'],
})
```

| 操作 | 路径 |
|------|------|
| 保存 | `emit('submit')` → `hideOn` |
| BaseDialog「关闭」 | 直接关层 |
| X / 遮罩 | `beforeClose` |

<DemoBlock
  :demo="Demo"
  title="打开编辑，改姓名后点 X 或关闭"
  :files="[{ name: 'UserForm.vue', code: FormSource }]"
/>

## 教程回顾

| § | 能力 | 组件 |
|---|------|------|
| 1 | 列表详情弹层 | UserDetail + useDetailLayer |
| 2 | OrderDetail 组合 | UserDetail 页内 |
| 3 | 编辑 | UserForm + useEditLayer |
| 4 | visible-outside | UserForm 页内保存 |
| 5 | adapt 换壳 | useDetailLayer |
| 6 | beforeClose | UserForm |

[API 参考](/api/)
