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
| `Content` | 内容组件；**可省略**（只要空壳、暂无业务体时） |
| `config` | 创建实例时的默认配置；顶层 `props` 指**内容**；可为响应式源 |

```ts
const dialog = useDialog(UserForm, {
  props: { mode: 'edit' },
})

// 响应式默认
const id = ref('1')
const dialog = useDialog(UserForm, () => ({
  props: { recordId: id.value },
}))
```

### 省略 Content（空壳）

```ts
const shell = useDialog()
shell.open({
  container: { props: { title: '仅外壳' } },
})
```

壳的配置请显式写在 `container:`。这**不是**「Dialog+表单写在一个文件里还没拆开」——那种情况见 [壳与内容未拆分](/guide/no-container)（`LayerNoContainer` + 单体做内容）。

## 返回值

[`LayerInstance`](./layer-instance)。在 setup 内创建时会自动尝试 `bindHost()`。

## 与 open 的关系

- 创建实例时的配置：可保持响应式  
- `open(config?)`：当次 **普通对象快照**（不要传函数）；空 `open()` 使用当前实例默认配置  

见 [指南：打开与关闭](/guide/open-close)。
