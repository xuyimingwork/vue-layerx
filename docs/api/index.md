# API

## 核心模式

```ts
export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)

const userLayer = useDetailLayer(UserForm)
userLayer.open({ props: { mode: 'view' | 'edit' | 'create', ... } })
```

一个内容组件 + 一个工厂。`mode: 'view'` 时 content 自行 disabled，不必拆 UserDetail。

## `createLayer`

```ts
createLayer(BaseDialog)                    // 配置可在 BaseDialog 内
createLayer(BaseDialog, {}, adaptFn)       // useDetailLayer
```

### `adapt`

窄屏把 `container.component` 从 BaseDialog 换为 BaseDrawer，并滤掉 `width` / `size` 等。见 [§5](/guide/adapt)。

## `defineLayer`

```ts
defineLayer({
  props: { title: '...', width: '480px', size: '85vw' },
  content: { closeOn: ['submit'] },  // view 模式通常无 submit
})
```

## `LayerTemplate`

`#default` 插槽参数为 `LayerTemplateScope`：

```ts
interface LayerTemplateScope<T = Record<string, unknown>> {
  inLayer: boolean
  outsideLayer: boolean
  /** 同名 slot 的 scoped props 原样转发；无参数时为 {} */
  slotProps: T
}
```

```vue
<!-- content 内：投进 container 同名 slot -->
<LayerTemplate name="footer" v-slot="{ inLayer, outsideLayer, slotProps }">
  ...
</LayerTemplate>

<!-- 调用方：远程投进 content 同名 slot -->
<LayerTemplate :to="userLayer" name="form-end" v-slot="{ slotProps: { data } }">
  ...
</LayerTemplate>

<!-- 调用方：远程投进 Dialog 等同名 slot（覆盖 content 内 LayerTemplate） -->
<LayerTemplate :to="userLayer" container name="footer">
  ...
</LayerTemplate>
```

- **creator**（content 内，无 `to`）：投进 Dialog 等同名 slot；`slotProps` 来自容器 slot 的 scoped props。
- **caller content**（`:to="userLayer"`）：投进 content 组件同名 `<slot>`。
- **caller container**（`:to` + `container`）：投进 Dialog 等同名 slot；优先级高于 creator。

**slot 优先级**（container 链）：`open > clone > useX > caller template > defineLayer > creator template > createLayer`。content 链：`open > clone > useX > caller template > define > create`。

`:to` 为 `useX(Content)` 返回的 `LayerInstance`。

`visible-outside`：页内 edit 也要保存按钮时再加。view 模式不需要 footer。

## 教程

[§1 列表详情](/guide/detail)
