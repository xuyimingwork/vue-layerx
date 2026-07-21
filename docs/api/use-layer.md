# useLayer

`createLayer` 的返回值，**不是** `vue-layerx` 的独立导出。

```ts
function useLayer(
  Content?: Component,
  config?: MaybeRefOrGetter<LayerConfigContent>,
): LayerInstance
```

## 参数

| 参数 | 说明 |
|------|------|
| `Content` | 内容组件；可省略（少见） |
| `config` | use tier；顶层 `props` 指**内容**；可为 live |

```ts
const dialog = useDialog(UserForm, {
  props: { mode: 'edit' },
})

// live
const id = ref('1')
const dialog = useDialog(UserForm, () => ({
  props: { recordId: id.value },
}))
```

## 返回值

[`LayerInstance`](./layer-instance)。在 setup 内创建时会自动尝试 `bindHost()`。

## 与 open 的关系

- `use` tier：实例默认配置（可 live）  
- `open(config?)`：当次 **plain 快照**（不可传 getter）；空 `open()` 吃当前 use / 更低 tier  

见 [指南：打开与关闭](/guide/open-close)。
