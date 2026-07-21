# defineLayer

```ts
function defineLayer(
  config?: MaybeRefOrGetter<LayerConfigContainer>,
): LayerDefine
```

## 调用位置

在**内容组件**的 `setup` 内调用；注册 `define` tier。

## 配置

`LayerConfigContainer`：顶层字段描述**容器**；内容侧字段放在 `content`（如 `closeOn`）。可为 live。

```ts
const layer = defineLayer({
  props: { title: '编辑用户', width: '480px' },
  content: { closeOn: ['submit'] },
})

// live
defineLayer(() => ({
  props: { title: `请确认（${left.value}s）` },
}))
```

## 返回值 `LayerDefine`

| 成员 | 说明 |
|------|------|
| `exists` | 是否作为 direct layer content 处于 live LayerView 上下文（弹层内 true，页内 / 嵌套 false） |

返回值用作 [`LayerTemplate`](./layer-template) 的 `:to`。**不**提供 `open` / `close`。

见 [指南：在内容里声明默认](/guide/define-layer)。
