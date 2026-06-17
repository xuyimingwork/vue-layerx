# vue-layerx

Vue 3 弹层工厂：把 **layer**（如 `ElDialog`）和 **content**（如 `CreateForm`）拆开，使用侧只需 `show()` / `hide()`，不必写 layer 模板、不必维护 `visible`。

```
UserDialog = MyDialog + UserForm
```

## 解决什么问题

业务弹窗通常是 layer + content 的组合，常见痛点：

1. **content 与 layer 绑死** — CreateForm 和某一种 Dialog 写在一起，换 Drawer 要复制或再拆一层。
2. **样板代码多** — 导入 Dialog 组件、写 template、声明 `visible`，而业务上往往只是想「把表单放进 Dialog 里展示」。

vue-layerx 让 content 可复用于页内与弹层，layer 通过 `createLayer` 统一适配，打开/关闭走同一套命令式 API。

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
import { createLayer } from 'vue-layerx'

export const useDialog = createLayer(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  layer: {
    props: {
      width: '480px',
      destroyOnClose: true,
      appendToBody: true,
    },
  },
})
```

### 定义侧：CreateForm.vue

content 内用 `defineLayer` 声明 layer 默认配置；footer 等 layer 插槽用 `LayerTemplate name` co-locate。

```vue
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

defineLayer({
  props: { title: '新建用户' },
})

const emit = defineEmits<{ success: []; cancel: [] }>()
</script>

<template>
  <el-form>
    <el-form-item>
      <slot name="header">
        <span>请填写用户信息</span>
      </slot>
    </el-form-item>
    <!-- ... -->
  </el-form>

  <LayerTemplate name="footer">
    <el-button type="primary" @click="emit('success')">确定</el-button>
    <el-button @click="emit('cancel')">取消</el-button>
  </LayerTemplate>
</template>
```

### 使用侧：UserList.vue

不写 layer template，不声明 `visible`。

```vue
<script setup lang="ts">
import { LayerScope, LayerTemplate } from 'vue-layerx'
import { useDialog } from '@/layers/dialog'
import CreateForm from './CreateForm.vue'

const userDialog = useDialog(CreateForm, {
  hideOn: ['success', 'cancel'],
})

function openCreate() {
  userDialog.show({ props: { mode: 'create' } })
}
</script>

<template>
  <el-button @click="openCreate">新建</el-button>

  <LayerScope :of="userDialog">
    <LayerTemplate name="header">
      <el-tag type="success">来自 UserList 的 header</el-tag>
    </LayerTemplate>
  </LayerScope>
</template>
```

完整可运行示例见 `playground/`。

## 架构

```
createLayer(MyDialog, defaults?, adapt?)
        │
        ▼
useDialog / useDrawer
        │
        ├── defineLayer ──────────────┐
        ├── useDialog(Content, opts) ──┤──► merge → resolve → adapt → render
        └── show(payload) ──────────────┘
        LayerTemplate（content 内）─── layerTemplates
        LayerScope（UserList）─── contentTemplates
```

`show()` 后渲染到 `document.body`（继承 `appContext`）。

## 配置合并

常规实例：`show > useX > defineLayer > createLayer(defaults)`

`clone` 实例：`show > partial > useX > defineLayer > createLayer(defaults)`

`show()` 每次强制 remount content；`show` 传入的 props 为当次快照。

## 公共 API

| 导出 | 说明 |
|------|------|
| `createLayer(layer, defaults?, adapt?)` | 注册容器，返回 `useDialog` 等工厂 |
| `defineLayer(options?)` | content.setup 内声明 layer 默认配置 |
| `LayerTemplate` | `name="footer"` 自注册 layer / content 模板 |
| `LayerScope` | `:of="instance"` 向 content slot 远程填充 |

### LayerInstance

| 成员 | 说明 |
|------|------|
| `show(payload?)` | 合并配置并打开 |
| `hide()` | 关闭 |
| `clone(partial?)` | 派生新实例（独立 `visible` 与 `partial` defaults） |
| `visible` | 当前是否打开 |

## 开发

```bash
pnpm install
pnpm test
pnpm build
pnpm playground
```

## 设计文档

更完整的背景、推导与边界说明见 [DESIGN.md](./DESIGN.md)。
