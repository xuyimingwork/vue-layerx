# API

## 导出

| 导出 | 说明 |
|------|------|
| `createLayer(Component, defaults?, adapt?)` | 如 `createLayer(BaseDialog)` 或带 `adapt` 的 `useDetailLayer` |
| `defineLayer(options?)` | 写在 UserDetail / UserForm 等内容组件 |
| `LayerTemplate` | 弹层 footer；`visible-outside` 页内/footer 双模式 |
| `LayerScope` | 调用方远程填充 content 插槽（少用） |

## `createLayer`

```ts
export const useEditLayer = createLayer(BaseDialog)

export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)
```

- 默认显隐协议：`modelValue` / `onUpdate:modelValue`（第二参数可省略）
- 壳组件默认 props 建议写在 **BaseDialog** 内，`createLayer` 更简洁

### `adapt`

```ts
type LayerAdapt = (normalized: LayerNormalized) => LayerNormalized
```

merge 之后、render 之前执行。教程案例：`useDetailLayer` 在窄屏把 `layer.component` 从 BaseDialog 换成 BaseDrawer，并滤掉对方用不到的 props。

见 [§5 useDetailLayer + adapt](/guide/adapt)。

## `defineLayer`

```ts
defineLayer({
  props: { title: '用户详情', width: '420px', size: '85vw' },
  hideOn: ['submit'],
})
```

| 字段 | 说明 |
|------|------|
| `props` | 合并到 layer（标题、beforeClose、跨壳尺寸） |
| `hideOn` | 主操作成功后关层；关闭按钮在 BaseDialog |

页内 `<UserDetail />` 时 defineLayer 不参与弹层渲染。

## `LayerTemplate`

```vue
<LayerTemplate name="footer" visible-outside>
  <template #default="{ inLayer, outsideLayer }">...</template>
</LayerTemplate>
```

## `LayerInstance`

```ts
detailLayer.show({ props: row })
editLayer.show({ props: { mode: 'edit', onSubmit: fn } })
instance.hide()
instance.visible
instance.clone({ layer: { props: { width: '640px' } } })
```

## 配置合并

`show > useX > defineLayer > createLayer(defaults)` · clone 时 `show > partial > …`

## 教程

[§1 列表详情](/guide/detail)

## 类型

```ts
import type {
  DefineLayerOptions,
  LayerAdapt,
  LayerInstance,
  LayerShowPayload,
  LayerTemplateScope,
} from 'vue-layerx'
```
