# vue-layerx 设计文档

## 背景：弹窗的问题

业务弹窗通常是 **Shell（容器）+ Inner（业务内容）** 的组合：

```
CreateDialog = ElDialog + CreateForm
```

这种写法有两个痛点：

1. **Inner 与 Shell 绑死**  
   CreateForm 往往和某一种 CreateDialog 写在一起；想换成 Drawer，需要再拆一层或复制。

2. **使用弹窗样板代码多**  
   导入 CreateDialog、写到 template、声明并维护 `visible`——而业务上往往只是想「把 CreateForm 放进 ElDialog 里展示」。

## 设计目标

| 角色 | 目标 |
|------|------|
| **Inner（CreateForm）** | 一定要写，且可复用于页内表单与弹层 |
| **Shell（ElDialog 等）** | 通过 `createLayerx` 适配，项目内类型有限 |
| **定义侧（CreateForm.vue）** | 承担原 CreateDialog 中与 Shell 相关的 co-locate 逻辑（插槽、默认 layer 配置） |
| **使用侧（UserList.vue）** | 极简：不写 Layer template、不声明 `visible`，仅 `createDialog.show()` / `hide()` |

工具独立于具体组件库，但每个 Shell 通过 `createLayerx` 注册一次，统一 `show()` / `hide()` 操作方式。

---

## 架构概览

```
createLayerx(Shell, { visible, props })     // 应用级：注册 Shell，注入 inject key
        │
        ▼
useDialog / useDrawer                       // 工厂函数，每个实例独立 visible
        │
        ├── useDialog.bind({ ... })         // 在 Inner.setup 内：注册 slots、props、hideOn
        │         ▲
        │         │ provide / inject（仅匹配同一 createLayerx 的父级 Layer 时生效）
        │         │
        └── useDialog(Inner, { props, layer, hideOn? })
                    │
                    ▼
              Layer 实例
                    ├─ visible（实例级，不参与 props 合并链）
                    ├─ show(payload?)  → merge 配置 + visible = true
                    ├─ hide()          → visible = false
                    └─ clone(partial?)  → 同配置新建 Layer 实例（新 visible）
```

**渲染树（`show()` 后）：**

```
LayerWrapper（provide layer context）
  └─ Shell（ElDialog，merged layer.props + visible）
       ├─ default slot → Inner（CreateForm，merged inner props）
       └─ footer 等 slot ← bind.slots 中 ref 指向的 LayerSlot 内容
```

---

## API 分层

### 1. `createLayerx(Shell, options?)`

将某一 Shell 收归 layer 体系，产出工厂（如 `useDialog`、`useDrawer`）。

```ts
const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: {
    width: '520px',
    destroyOnClose: true,
  },
})
```

| 字段 | 作用 |
|------|------|
| `visible` | Shell 显隐 prop / event 协议（适配非 Element Plus 组件） |
| `props` | 传给 Shell 的默认 props（如 `destroyOnClose`、`width`） |

每个 `createLayerx` 拥有 **独立的 inject key**，避免 Dialog / Drawer 等多工厂并存时串台。

---

### 2. `useDialog.bind(options?)`（在 Inner.setup 内调用）

在 CreateForm 内声明「放入 Shell 时生效」的配置；**无返回值**。

```ts
const footerRef = ref()

useDialog.bind({
  props: {
    title: '新建',
    beforeClose: handleBeforeClose, // 正常透传给 ElDialog
  },
  slots: {
    footer: footerRef,
  },
  hideOn: ['success', 'cancel'],
})
```

若项目还有 Drawer，同一 CreateForm 可额外调用：

```ts
useDrawer.bind({
  slots: { 'header-end': footerRef }, // 同一 LayerSlot ref，key 对应该 Shell 的插槽名
})
```

**激活条件：** `useDialog(CreateForm)` 渲染 Inner 时，LayerWrapper 与 Inner 构成 provide / inject 父子关系；仅 **匹配当前 createLayerx inject key** 的 bind 生效。

**未激活时（例如 CreateForm 仅内嵌在页面中）：** bind 内所有配置不生效；`LayerSlot` 不输出 DOM。

| 字段 | 作用 |
|------|------|
| `props` | Shell props 默认值（CreateForm 定义侧） |
| `slots` | `{ [shellSlotName]: Ref<LayerSlotInstance> }`，key 为 **当前 createLayerx 下 Shell 的插槽名** |
| `hideOn` | Inner 的 emit 名列表；触发后 Layer 自动 `hide()` |

---

### 3. `LayerSlot`（通用包裹组件）

在 CreateForm template 中标记「将被 bind 抓走、渲染到 Shell 插槽」的内容。

```vue
<template>
  <!-- 表单主体 -->
  <el-form>...</el-form>

  <!-- 渲染到 ElDialog.footer；无需 name 属性 -->
  <LayerSlot ref="footerRef">
    <el-button @click="submit">确定</el-button>
    <el-button @click="emit('cancel')">取消</el-button>
  </LayerSlot>
</template>
```

- 插槽名 **仅由** `bind.slots` 的 key 决定（如 `footer`、`header-end`），与 LayerSlot 自身无关。
- Shell 渲染对应插槽时读取 ref；ref 未就绪时该插槽为空，待 Inner mount 后再填充。
- 不在 Layer 内使用时 **不渲染**，避免 footer 按钮出现在普通页面。

---

### 4. `useDialog(Inner, options?)`（在使用侧 setup 内调用）

建立 **Inner 与当前组件** 的 Layer 联系；每个调用产生 **一个 Layer 实例 + 一份 visible**。

```ts
const createDialog = useDialog(CreateForm, {
  props: { mode: 'create' },           // Inner 默认 props
  layer: { props: { title: '新建用户' } }, // Shell 覆盖
  hideOn: ['success'],                 // 可选，参与合并
})
```

| 字段 | 作用 |
|------|------|
| `props` | Inner 默认 props |
| `layer.props` | Shell props 覆盖 |
| `hideOn` | 可选，覆盖 bind 层行为 |

**visible：** 绑定在本 Layer 实例上，**不参与** props 合并链；仅通过 `show()` / `hide()`（及 Shell 触发的关闭）改变。

**使用位置：** 应在业务组件 `setup` 内调用。若在模块顶层调用，则为全局唯一实例。

---

### 5. `show(payload?)` / `hide()` / `clone(partial?)`

```ts
createDialog.show({
  id: 1,
  mode: 'edit',
  layer: { props: { title: '编辑用户' } },
})

createDialog.hide()

const detailDialog = createDialog.clone({
  layer: { props: { title: '详情' } },
})
```

| API | 行为 |
|-----|------|
| `show(payload?)` | 合并 payload 中的 Inner props 与 `layer.props`，然后 `visible = true` |
| `hide()` | `visible = false` |
| `clone(partial?)` | 等价于以相同 merge 基线再执行一次 `useDialog(Inner, options)`；**新 visible**，配置独立；`partial` 仅覆盖 useDialog 层（及可继承的默认值） |

`show()` 多次调用 **不会** 打开多个弹窗——同一 Layer 实例始终只有一个 Shell。需要并存多个弹窗时使用 `clone()` 或多次 `useDialog(Inner, ...)`。

---

## 配置合并

### 优先级

```
show > useDialog > bind > createLayerx
```

### 双通道

Shell 与 Inner 分开合并，避免 `show({ id: 1 })` 与 Shell 配置混淆。

| 配置对象 | 合并通道 | 参与层级 |
|----------|----------|----------|
| `props`（createLayerx / bind） | Shell → `layer.props` | createLayerx、bind |
| `layer.props`（useDialog / show） | Shell | useDialog、show |
| `props`（useDialog） | Inner | useDialog |
| `show()` 顶层字段（除 `layer`） | Inner | show |
| `hideOn` | 行为 | bind、useDialog、show（按优先级覆盖） |

**visible 不在上表内**——每个 `useDialog` 实例独占。

### 示例

```ts
// createLayerx
props: { width: '520px', destroyOnClose: false }

// bind
props: { title: '新建', destroyOnClose: true }

// useDialog
layer: { props: { width: '640px' } }

// show
layer: { props: { title: '编辑' } }

// 最终 Shell：width='640px', destroyOnClose=true, title='编辑'
```

---

## 关闭行为

| 触发方式 | 行为 |
|----------|------|
| `hideOn` 中的 emit（如 `success`） | Layer 自动 `hide()`；submit 成功后应 `emit('success')` |
| Shell 自带关闭（X、遮罩、ESC） | Layer 内部 `hide()`；可由 merged `layer.props` 控制（如 `closeOnClickModal`） |
| `beforeClose` | 作为 Shell prop 配置在 `bind.props` / `layer.props` 中，正常透传给 ElDialog |
| 校验失败 / 不应关闭 | 不 emit hideOn 中的事件 |

不在 bind 中返回 `dialog` 对象；Inner 内 **不** inject `hide()`，关闭统一由 emit + hideOn 或 Shell 交互完成。

---

## 数据与实例语义

### 命令式传参，非响应式

弹窗打开时通过 `show(payload)` 传入 Inner 参数，视为 **打开时刻的快照**；打开期间父组件数据变化 **不** 自动同步进弹窗。若需最新数据，关闭后重新 `show()`。

### 单例与 clone

- 一次 `useDialog(CreateForm)` = 一个 Layer 实例 = 一个 `visible`。
- 与「template 里写一个 CreateDialog、一个 visible 变量」语义一致。
- `clone()` = 同 Inner、同 merge 基线下再创建一个 Layer 实例，visible 与 payload 互不影响。

### 上下文

`useDialog` 在 setup 内调用时可正确获取 Vue 应用上下文（plugins、i18n 等）。命令式渲染到 `body` 时需继承 `appContext`（实现细节）。

---

## CreateForm 的角色

相比单独编写 `CreateDialog.vue`：

```
CreateDialog.vue  ≈  CreateForm.vue + useDialog.bind + LayerSlot
```

- **视觉归属 Shell 插槽**（footer 等渲染在 ElDialog 内）
- **定义归属 CreateForm 文件**（LayerSlot co-locate，替代 CreateDialog 中的 template 部分）
- CreateForm 可同时用于 **页内表单** 与 **弹层**；后者通过 bind + Layer 激活，前者 bind 不生效

若同一 CreateForm 需支持 Dialog 与 Drawer：在 setup 内分别 `useDialog.bind` / `useDrawer.bind`，共用同一 `footerRef` 即可，插槽 key 各按对应 Shell 命名。

---

## 完整示例

### 应用级

```ts
// layer/dialog.ts
export const useDialog = createLayerx(ElDialog, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: { width: '520px', destroyOnClose: true },
})

export const useDrawer = createLayerx(ElDrawer, {
  visible: ['modelValue', 'onUpdate:modelValue'],
  props: { size: '480px' },
})
```

### CreateForm.vue（定义侧）

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/layer/dialog'

const props = defineProps<{ id?: number; mode?: string }>()
const emit = defineEmits<{ success: []; cancel: [] }>()

const footerRef = ref()

useDialog.bind({
  props: {
    title: '新建用户',
    beforeClose: (done) => { /* ... */ done() },
  },
  slots: { footer: footerRef },
  hideOn: ['success', 'cancel'],
})

async function submit() {
  // ...
  emit('success')
}
</script>

<template>
  <el-form>...</el-form>

  <LayerSlot ref="footerRef">
    <el-button type="primary" @click="submit">确定</el-button>
    <el-button @click="emit('cancel')">取消</el-button>
  </LayerSlot>
</template>
```

### UserList.vue（使用侧）

```vue
<script setup lang="ts">
import { useDialog } from '@/layer/dialog'
import CreateForm from './CreateForm.vue'

const createDialog = useDialog(CreateForm, {
  layer: { props: { title: '新建' } },
})

function openCreate() {
  createDialog.show({ mode: 'create' })
}

function openEdit(row: { id: number }) {
  createDialog.show({ id: row.id, mode: 'edit', layer: { props: { title: '编辑' } } })
}
</script>

<template>
  <!-- 无需写 CreateDialog、无需 visible -->
  <el-button @click="openCreate">新建</el-button>
</template>
```

---

## 类型（方向）

- `createLayerx` 注册 Shell 的 **props 类型** 与 **合法 slot 名**，约束 `bind.slots` 的 key。
- `useDialog(Inner, options)` 推断 Inner 的 `props`；`layer.props` 推断为 Shell props。
- `show()` 推断 Inner payload 与 `layer.props` 覆盖。
- `LayerSlot` 无需 `name` prop；类型由 ref + bind.slots 关联。

---

## 非目标与外包责任

| 项 | 说明 |
|----|------|
| z-index 栈 | 交给各 Shell（如 ElDialog）处理 |
| 打开期间响应式同步 | 不支持；见「命令式传参」 |
| 使用侧声明式 template | 使用侧以 `show()` / `hide()` 为主，不写 Layer 节点 |
| `useLayerBody` | **已废弃**；由 `bind` + `LayerSlot` + provide/inject 替代 |

---

## 推导小结

1. Inner（CreateForm）不可省；Shell 通过 `createLayerx` 适配。
2. 使用侧目标 API：`createDialog.show()` / `hide()`，不维护 `visible`。
3. Shell 配置走 `props` / `layer.props` 四层合并；Inner 配置走 `props` / `show()` payload。
4. 插槽由 CreateForm 内 `LayerSlot` + `bind.slots` ref 注册，key 即 Shell 插槽名。
5. 关闭由 `hideOn` + Shell 原生关闭 + `beforeClose`（透传 prop）完成。
6. 每个 `useDialog` 独立 visible；`clone()` 复制 Layer 实例而非复制弹窗 DOM 个数。
