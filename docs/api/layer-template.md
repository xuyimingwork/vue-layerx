# LayerTemplate

```vue
<LayerTemplate
  :to="layerOrInstance"
  name="footer"
  container?          <!-- 仅 caller：投 container slot -->
  visible-outside?    <!-- 页内也渲染 -->
>
  ...
</LayerTemplate>
```

## Props

| Prop | 说明 |
|------|------|
| `to` | **必填**。内容侧：`defineLayer()` 返回值；调用方：`LayerInstance` |
| `name` | 目标 slot 名 |
| `container` | 仅 caller：写入容器 slot 链，而非内容 slot 链 |
| `visibleOutside` | 页内在原位置也渲染；弹层内仍投递 slot |

## 投递目标

| 写法 | 目标 |
|------|------|
| 内容内 `:to="layer"` | 容器同名 slot（`container` prop 无效） |
| 调用方 `:to="instance"` | 内容同名 `<slot>` |
| 调用方 `:to` + `container` | 容器同名 slot（高于内容侧模板） |

## 插槽

`#default`：目标 slot 的 scoped props **flat 透传**。宿主态用 `layer.exists`（`LayerDefine`），不经 slot scope。

## 优先级

slot 统一链：`open > use > use:template > define > define:template > create`。

见 [指南：用模板填写插槽](/guide/layer-template)。
