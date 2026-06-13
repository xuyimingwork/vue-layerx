# vue-layerx

Vue 3 弹层工厂：把 **layer**（如 `ElDialog`）和 **content**（如 `CreateForm`）拆开，使用侧只需 `show()` / `hide()`，不必写 layer 模板、不必维护 `visible`。

```
CreateDialog ≈ CreateForm + useDialog.layer + LayerTemplate
```

## 解决什么问题

业务弹窗通常是 layer + content 的组合，常见痛点：

1. **content 与 layer 绑死** — CreateForm 和某一种 Dialog 写在一起，换 Drawer 要复制或再拆一层。
2. **样板代码多** — 导入 Dialog 组件、写 template、声明 `visible`，而业务上往往只是想「把表单放进 Dialog 里展示」。

vue-layerx 让 content 可复用于页内与弹层，layer 通过 `createLayerx` 统一适配，打开/关闭走同一套命令式 API。

## 术语

| 术语 | 含义 | 示例 |
|------|------|------|
| **layer** | 外层容器组件 | `ElDialog`、`ElDrawer` |
| **content** | 内层业务内容组件 | `CreateForm` |
| **Layer 实例** | `useDialog(CreateForm)` 的返回值 | `{ show, hide, clone, visible }` |

## 快速开始

### 应用级：注册 layer

```ts
// layers/dialog.ts
import { ElDialog } from 'element-plus'
import { createLayerx } from 'vue-layerx'

export const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    width: '480px',
    destroyOnClose: true,
    appendToBody: true,
  },
})
```

### 定义侧：CreateForm.vue

content 内声明 layer 配置，footer 等 layer 插槽用 `LayerTemplate` co-locate；content 自己的 slot 正常写在 template 里。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '@/layers/dialog'

const footerRef = ref()

useDialog.layer({
  props: { title: '新建用户' },
  slots: { footer: footerRef },
})

const emit = defineEmits<{ success: []; cancel: [] }>()
</script>

<template>
  <el-form>
    <!-- content 自己的 slot，由使用侧注入 -->
    <el-form-item>
      <slot name="header">
        <span>请填写用户信息</span>
      </slot>
    </el-form-item>
    <!-- ... -->
  </el-form>

  <!-- layer 插槽：渲染到 ElDialog.footer，页内使用时不出 DOM -->
  <LayerTemplate ref="footerRef">
    <el-button type="primary" @click="emit('success')">确定</el-button>
    <el-button @click="emit('cancel')">取消</el-button>
  </LayerTemplate>
</template>
```

### 使用侧：UserList.vue

不写 layer template，不声明 `visible`。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '@/layers/dialog'
import CreateForm from './CreateForm.vue'

const headerRef = ref()

const userDialog = useDialog(CreateForm, {
  slots: { header: headerRef },       // 注入 CreateForm 的 #header
  hideOn: ['success', 'cancel'],
})

function openCreate() {
  userDialog.show({
    props: { mode: 'create' },
    layer: { props: { title: '新建用户' } },
  })
}
</script>

<template>
  <el-button @click="openCreate">新建</el-button>

  <LayerTemplate ref="headerRef">
    <el-tag type="success">来自 UserList 的 header</el-tag>
  </LayerTemplate>
</template>
```

完整可运行示例见 `playground/`。

## 架构

```
createLayerx(Layer, options)
        │
        ▼
useDialog / useDrawer
        │
        ├── useDialog.layer(options)     // content.setup：layer 级默认配置
        │
        └── useDialog(Content, options)  // 使用侧：得到一个 Layer 实例
                    │
                    ├─ .show(payload?)
                    ├─ .hide()
                    └─ .clone(partial?)
```

`show()` 后渲染到 `document.body`（继承 `appContext`），结构：

```
LayerRoot
  └─ layer（ElDialog）
       ├─ default → content（CreateForm）
       └─ footer 等 ← layer slots（LayerTemplate）
```

## Options 结构

两套 options，字段固定。

### Layer 级 — `createLayerx` & `useDialog.layer()`

```ts
{
  visible?: ['modelValue', 'onUpdate:modelValue']
  props?: { ... }              // layer 组件 props
  slots?: { [name]: ref }      // layer 插槽 → LayerTemplate ref
  content?: { props?: { ... } } // 默认 content props
}
```

### Content 级 — `useDialog(Content)` & `show()`

```ts
{
  props?: { ... }              // content 组件 props
  slots?: { [name]: ref }      // content 组件 slot → LayerTemplate ref
  hideOn?: string[]            // content emit 触发自动 hide
  layer?: { ... }              // layer 覆盖，结构与 Layer 级 options 相同
}
```

## 两种 slot

底层用同一套机制（`LayerTemplate` + ref + `render()`），但挂载目标不同：

| 配置位置 | 传给谁 | 典型用途 |
|----------|--------|----------|
| `layer()` / `createLayerx` / `layer.slots` 的 `slots` | **layer 组件**（ElDialog `#footer` 等） | CreateForm 内 co-locate 底部按钮 |
| `useDialog` / `show` 的 `slots` | **content 组件**（CreateForm `#header` 等） | UserList 向表单内注入内容 |

```ts
// layer slot — 出现在 ElDialog.footer
useDialog.layer({ slots: { footer: footerRef } })

// content slot — 出现在 CreateForm 的 <slot name="header">
useDialog(CreateForm, { slots: { header: headerRef } })
```

## 配置合并

优先级：`show > useDialog > layer() > createLayerx`

| 字段 | 合并来源（低 → 高） |
|------|---------------------|
| layer `props` | `createLayerx.props` → `layer().props` → `useDialog.layer.props` → `show.layer.props` |
| content `props` | `createLayerx.content.props` → `layer().content.props` → `useDialog.props` → `show.props` |
| layer `slots` | `createLayerx.slots` → `layer().slots` → `useDialog.layer.slots` → `show.layer.slots` |
| content `slots` | `useDialog.slots` → `show.slots` |
| `hideOn` | `useDialog.hideOn` → `show.hideOn` |

`visible` 不参与合并，每个 Layer 实例独占，仅通过 `show()` / `hide()` 改变。

`show()` 传入的参数视为打开时刻快照，打开期间父组件数据变化不会自动同步进弹层。

## API

### `createLayerx(Layer, options?)`

注册 layer 组件，返回工厂函数（如 `useDialog`）。

### `useDialog.layer(options?)`

在 content 的 `setup` 内调用，声明 layer 级默认配置；仅在 content 被 Layer 渲染时生效（provide / inject），页内单独使用 content 时不生效。

### `LayerTemplate`

标记将被 slot 配置引用的内容。直接作为 layer Content 时不占本地 DOM；`visible-outside` 开启时在 layer 外就地渲染。default slot scope：`inLayer` / `outsideLayer`。

### `useDialog(Content, options?) → LayerInstance`

| 成员 | 说明 |
|------|------|
| `show(payload?)` | 合并配置并打开 |
| `hide()` | 关闭 |
| `clone(partial?)` | 同配置新建实例（独立 `visible`） |
| `visible` | 当前是否打开 |

### 关闭行为

- content `emit` 命中 `hideOn` → 自动 `hide()`
- layer 自带关闭（X、遮罩、ESC）→ 内部 `hide()`
- `beforeClose` 等通过 layer `props` 透传

## 开发

```bash
pnpm install
pnpm test
pnpm build
pnpm playground   # 启动 Element Plus 示例
```

Playground 位于 `playground/`（Vite + Vue 3 + TS），通过 alias 直接引用 `src/` 便于联调。

### 源码结构

```
src/
  create-layerx.ts       # createLayerx 入口
  use-layer.ts           # 工厂、layer()、show/hide/clone
  layer-template.ts      # LayerTemplate 组件
  build-vnode.ts         # 渲染 layer → content
  body-renderer.ts       # 命令式挂载到 body
  layer-config.ts        # visible 协议解析
  types.ts
  utils/
    merge-config.ts      # 配置合并
    bind-hide-on.ts      # hideOn 事件绑定
```

## 设计文档

更完整的背景、推导与边界说明见 [DESIGN.md](./DESIGN.md)。
