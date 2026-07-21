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
| `config` | 工厂默认配置；可为 plain / ref / getter / computed |

`LayerConfigCreate`：容器扁平字段 + 可选 `content` + 可选 `adapter`。顶层 `props` / `model` / `slots` 等描述**容器**。见 [配置](./config)。

## 返回值

返回绑定了该工厂 `create` tier 与 `adapter` 的 [`useLayer`](./use-layer)。

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

在 merge 之后、bind 之前整形 fragment。见 [指南：adapter](/guide/adapter)。
