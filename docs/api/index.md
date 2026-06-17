# API

## 核心模式

```ts
export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)

const userLayer = useDetailLayer(UserForm)
userLayer.show({ props: { mode: 'view' | 'edit' | 'create', ... } })
```

一个内容组件 + 一个工厂。`mode: 'view'` 时 content 自行 disabled，不必拆 UserDetail。

## `createLayer`

```ts
createLayer(BaseDialog)                    // 配置可在 BaseDialog 内
createLayer(BaseDialog, {}, adaptFn)       // useDetailLayer
```

### `adapt`

窄屏把 `layer.component` 从 BaseDialog 换为 BaseDrawer，并滤掉 `width` / `size` 等。见 [§5](/guide/adapt)。

## `defineLayer`

```ts
defineLayer({
  props: { title: '...', width: '480px', size: '85vw' },
  hideOn: ['submit'],  // view 模式通常无 submit
})
```

## `LayerTemplate`

`visible-outside`：页内 edit 也要保存按钮时再加。view 模式不需要 footer。

## 教程

[§1 列表详情](/guide/detail)
