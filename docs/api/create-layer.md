# createLayer

```ts
function createLayer(
  Container: Component,
  config?: MaybeRefOrGetter<LayerConfigCreate>,
): typeof useLayer
```

## 参数

| 参数 | 说明 |
|------|------|
| `Container` | 容器组件（`v-model` 显隐 + 通常有 default slot） |
| `config` | 该组合式函数的默认配置；可为 plain / ref / getter / computed |

`LayerConfigCreate`：容器扁平字段 + 可选 `content` + 可选 `adapter`。顶层 `props` / `model` / `slots` 等描述**容器**。见 [配置](./config)。

## 返回值

返回绑定了上述默认配置与可选 `adapter` 的 [`useLayer`](./use-layer)。

```ts
export const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
  adapter: (fragment) => fragment,
})
```

## adapter

```ts
type LayerAdapter = (fragment: LayerConfigFragment) => LayerConfigFragment
```

在配置合并之后、渲染之前整形。见 [指南：按环境换容器](/guide/adapter)。
