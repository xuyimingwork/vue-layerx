# vue-layerx 设计文档

## 背景：弹窗的问题

业务弹窗通常是 **layer（容器）+ content（业务内容）** 的组合：

```
CreateDialog = ElDialog + CreateForm
```

这种写法有两个痛点：

1. **content 与 layer 绑死**  
   CreateForm 往往和某一种 CreateDialog 写在一起；想换成 Drawer，需要再拆一层或复制。

2. **使用弹窗样板代码多**  
   导入 CreateDialog、写到 template、声明并维护 `visible`——而业务上往往只是想「把 CreateForm 放进 ElDialog 里展示」。

## 设计目标

| 角色 | 目标 |
|------|------|
| **content（CreateForm）** | 一定要写，且可复用于页内表单与弹层 |
| **layer（ElDialog 等）** | 通过 `createLayerx` 适配，项目内类型有限 |
| **定义侧（CreateForm.vue）** | 承担原 CreateDialog 中与 layer 相关的 co-locate 逻辑（插槽、默认 layer 配置） |
| **使用侧（UserList.vue）** | 极简：不写 layer template、不声明 `visible`，仅 `createDialog.show()` / `hide()` |

工具独立于具体组件库，但每个 layer 通过 `createLayerx` 注册一次，统一 `show()` / `hide()` 操作方式。

---

## 术语

| 术语 | 含义 | 示例 |
|------|------|------|
| **layer** | 外层容器组件 | ElDialog、ElDrawer |
| **content** | 内层业务内容组件 | CreateForm |
| **Layer 实例** | `useDialog(CreateForm)` 的返回值 | 含 `show` / `hide` / `clone` / `visible` |

## Options 结构

两套 options，字段固定：

### Layer 级 — `createLayerx` & `useLayer.layer()`

```ts
{
  visible?: [prop, event]   // 显隐协议
  props?: { ... }           // layer 组件 props
  slots?: { [name]: ref }   // layer 插槽 → LayerSlot ref
  content?: { props?: { ... } }  // 默认 content props
}
```

### Content 级 — `useLayer(Content)` & `show()`

```ts
{
  props?: { ... }           // content 组件 props
  slots?: { [name]: ref }   // layer 插槽覆盖（可选）
  hideOn?: string[]         // content emit 触发关闭
  layer?: LayerOptions      // layer 覆盖，结构与 Layer 级 options 相同
}
```

---

## 架构概览

```
createLayerx(Layer, { visible, props, slots, content })
        │
        ▼
useDialog / useDrawer
        │
        ├── useDialog.layer({ props, slots, content })  // content.setup 内
        │         ▲
        │         │ provide / inject
        │         │
        └── useDialog(Content, { props, slots, hideOn, layer? })
                    │
                    ▼
              Layer 实例
                    ├─ show({ props, slots, hideOn, layer? })
                    ├─ hide()
                    └─ clone(partial?)
```

**渲染树（`show()` 后）：**

```
LayerRoot（provide layer context）
  └─ layer（ElDialog，merged layer.props + visible）
       ├─ default slot → content（merged content.props）
       └─ footer 等 slot ← merged slots 中 LayerSlot ref 内容
```

---

## API 分层

### 1. `createLayerx(Layer, options?)`

```ts
const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: { width: '520px', destroyOnClose: true },
  content: { props: { mode: 'create' } },
})
```

### 2. `useDialog.layer(options?)`（在 content.setup 内调用）

与 `createLayerx` options **结构相同**；在 CreateForm 内声明 layer 级配置。

```ts
const footerRef = ref()

useDialog.layer({
  props: { title: '新建', beforeClose: handleBeforeClose },
  slots: { footer: footerRef },
})
```

**激活条件：** content 被 Layer 渲染时，匹配 inject key 的 `layer()` 才生效；页内单独使用时无效。

### 3. `LayerSlot`

标记将被 `layer().slots` 引用、渲染到 layer 插槽的内容；不在 Layer 内时不输出 DOM。

### 4. `useDialog(Content, options?)`

```ts
const createDialog = useDialog(CreateForm, {
  props: { mode: 'create' },
  layer: { props: { title: '新建用户' } },
  hideOn: ['success', 'cancel'],
})
```

### 5. `show()` / `hide()` / `clone()`

```ts
createDialog.show({
  props: { id: 1, mode: 'edit' },
  layer: { props: { title: '编辑用户' } },
})

createDialog.hide()

createDialog.clone({ layer: { props: { title: '详情' } } })
```

`show()` options 与 `useDialog(Content)` **结构相同**。

---

## 配置合并

### 优先级

```
show > useDialog > layer() > createLayerx
```

### 各字段合并

| 字段 | 合并来源（低 → 高优先级） |
|------|--------------------------|
| layer `props` | createLayerx.props → layer().props → useDialog.layer.props → show.layer.props |
| content `props` | createLayerx.content.props → layer().content.props → useDialog.props → show.props |
| `slots` | createLayerx.slots → layer().slots → useDialog.layer.slots → useDialog.slots → show.layer.slots → show.slots |
| `hideOn` | useDialog.hideOn → show.hideOn |

**visible** 不参与合并，每个 Layer 实例独占。

### 示例

```ts
// createLayerx
props: { width: '520px', destroyOnClose: false }

// layer()
props: { title: '新建', destroyOnClose: true }

// useDialog
layer: { props: { width: '640px' } }

// show
layer: { props: { title: '编辑' } }

// 最终 layer props：width='640px', destroyOnClose=true, title='编辑'
```

---

## 关闭行为

| 触发方式 | 行为 |
|----------|------|
| `hideOn` emit | Layer 自动 `hide()` |
| layer 自带关闭 | 内部 `hide()`；由 merged layer props 控制 |
| `beforeClose` | 配置在 layer props 中透传 |
| 校验失败 | 不 emit hideOn 事件 |

---

## 完整示例

### 应用级

```ts
export const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: { width: '520px', destroyOnClose: true },
})
```

### CreateForm.vue（定义侧）

```vue
<script setup lang="ts">
const footerRef = ref()

useDialog.layer({
  props: { title: '新建用户' },
  slots: { footer: footerRef },
})
</script>

<template>
  <el-form>...</el-form>
  <LayerSlot ref="footerRef">
    <el-button @click="submit">确定</el-button>
  </LayerSlot>
</template>
```

### UserList.vue（使用侧）

```vue
<script setup lang="ts">
const createDialog = useDialog(CreateForm, {
  props: { mode: 'create' },
  layer: { props: { title: '新建' } },
  hideOn: ['success', 'cancel'],
})

function openEdit(row) {
  createDialog.show({
    props: { id: row.id, mode: 'edit' },
    layer: { props: { title: '编辑' } },
  })
}
</script>
```

---

## 推导小结

1. Layer 级 options：`visible + props + slots + content`（createLayerx、useLayer.layer）
2. Content 级 options：`props + slots + hideOn + layer`（useLayer、show）
3. 使用侧仅 `show()` / `hide()`，不维护 `visible`
4. 插槽由 LayerSlot + merged slots 驱动，key 即 layer 插槽名
5. `hideOn` 仅在 content 级配置
