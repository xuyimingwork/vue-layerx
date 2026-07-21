<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/steps/03-edit/App.vue'
import FormSource from '../../examples/tutorial/UserForm.vue?raw'
</script>

# §6 未保存拦截

::: info 本章新增
`defineLayer.props.beforeClose`（仅 edit/create 有脏数据时）
:::

```ts
beforeClose: (done) => {
  if (mode === 'view' || !dirty) { done(); return }
  if (confirm('未保存？')) done()
}
```

| 操作 | 行为 |
|------|------|
| view 模式关闭 | 直接关 |
| edit 点保存 | `closeOn` |
| edit 有脏数据点 X | `beforeClose` |

<DemoBlock :demo="Demo" :files="[{ name: 'UserForm.vue', code: FormSource }]" />

## 回顾

一个 **UserForm** + 一个 **useDetailLayer**：view / edit / create、页内嵌入、adapt 换壳、visible-outside 页内保存。

[API](/api/)
