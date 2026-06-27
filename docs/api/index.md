# API

## 核心模式

```ts
export const useDetailLayer = createLayer(BaseDialog, { adapter: detailAdapt })

const userLayer = useDetailLayer(UserForm)
userLayer.open({ props: { mode: 'view' | 'edit' | 'create', ... } })
```

一个内容组件 + 一个工厂。`mode: 'view'` 时 content 自行 disabled，不必拆 UserDetail。

## `createLayer`

```ts
createLayer(BaseDialog)                              // 配置可在 BaseDialog 内
createLayer(BaseDialog, { adapter: adaptFn })        // useDetailLayer
```

### `adapt`

窄屏把 `container.component` 从 BaseDialog 换为 BaseDrawer，并滤掉 `width` / `size` 等。见 [§5](/guide/adapt)。

## `defineLayer`

```ts
const layer = defineLayer({
  props: { title: '...', width: '480px', size: '85vw' },
  content: { closeOn: ['submit'] },  // view 模式通常无 submit
})
// layer: LayerDefine — layer.inLayer / layer.outsideLayer — 弹层内为 true/false，页内为 false/true
```

## `LayerTemplate`

**`:to` 必填。** creator 传 `defineLayer()` 返回值；caller 传 `LayerInstance`。

**creator**（`:to="layer"`）与 **visible-outside** 的 `#default` 插槽参数为 `LayerTemplateScope`：

```ts
interface LayerTemplateScope<T = Record<string, unknown>> {
  inLayer: boolean
  outsideLayer: boolean
  /** 同名 slot 的 scoped props 原样转发；无参数时为 {} */
  slotProps: T
}
```

**caller**（`:to` / `:to container`）的 `#default` 与 Vue scoped slot 相同：目标 slot 的 props **flat 透传**（无 `inLayer` / `outsideLayer` / `slotProps` 包装）。

```vue
<!-- content 内：投进 Dialog 等同名 container slot -->
<LayerTemplate :to="layer" name="footer" v-slot="{ inLayer, outsideLayer, slotProps }">
  ...
</LayerTemplate>

<!-- 调用方：远程投进 content 同名 slot -->
<LayerTemplate :to="userLayer" name="form-end" v-slot="{ data }">
  ...
</LayerTemplate>

<!-- 调用方：远程投进 Dialog 等同名 slot（覆盖 content 内 LayerTemplate） -->
<LayerTemplate :to="userLayer" container name="footer" v-slot="{ confirmLoading }">
  ...
</LayerTemplate>
```

- **creator**（`:to="layer"`，`defineLayer()` 返回值）：固定投进 Dialog 等同名 container slot；`container` prop 无效；`slotProps` 来自容器 slot 的 scoped props。
- **caller content**（`:to="userLayer"`）：投进 content 组件同名 `<slot>`；`#default` 参数即 content slot 的 scoped props。
- **caller container**（`:to` + `container`）：投进 Dialog 等同名 slot；优先级高于 creator；`#default` 参数即 container slot 的 scoped props。

**slot 优先级**（统一链）：`open > use > use:template > define > define:template > create`。

`:to` 为 `useX(Content)` 返回的 `LayerInstance`。

`visible-outside`：页内 edit 也要保存按钮时再加。view 模式不需要 footer。

## `LayerInstance`

| 方法 / 属性 | 说明 |
|-------------|------|
| `open(config?)` | 打开弹层；关闭后再打开会重建 content；已打开时 open 更新配置 |
| `close()` | 关闭（不卸 DOM 挂载点） |
| `unmount()` | 卸 portal DOM；**不**清 viewHost |
| `clone(config?)` | 独立 instance；继承工厂配置与 `use` tier；setup 内自动 `bindHost()` |
| `visible` | 只读是否打开 |
| `bindHost()` | 绑定**本 instance** 当前 setup Host 的 provide / appContext；重复调用 no-op；`useLayer` 在 setup 内自动调用 |

**全局单例**（模块 `export const messageBox = useLayer(...)`）须在 App 或 `ElConfigProvider` **子树内** setup 调用 `messageBox.bindHost()`，否则 content 无法 inject ConfigProvider。

## 教程

[§1 列表详情](/guide/detail)
