# 远程出口（Remote Outlet）：通用布局原语架构设计提案

* **状态**：ADR 进行中（讨论纪要 + 架构模型确认）
* **日期**：2026-07-30
* **关联**：[DESIGN.md](https://www.google.com/search?q=../../DESIGN.md) 跨树投递协议；[LayerTemplate 指南](https://www.google.com/search?q=../guide/layer-template.md)

---

## 1. 核心问题与设计动机

### 1.1 组件化复用中的「工程鸿沟（Gap）」

在现代企业级前端开发中，随着“框架外壳（Shell/Layout）”**与**“命令式弹层（Layer）”的广泛应用，普通的组件树组合模型遇到了结构性的撕裂：

* **动作与逻辑的撕裂（Layout 下沉反模式）**：若将底栏或工具栏（Toolbar）直接纳入业务组件内部，为了复用（例如在不需要工具栏的卡片中展示），不得不通过 `props` 传入大量的布局开关（如 `:show-toolbar="false"`）。组件职责过载，形态臃肿。
* **强交互行为的配置化地狱**：若将工具栏抽象为纯数据对象（`Object Config`）传给外壳，当子组件需要在点击工具栏按钮时打开一个**内部私有的 Dialog** 时，就不得不将私有状态（`visible`）或方法提升至全局或通过 `expose` 强行暴露，彻底破坏了组件的封装性。
* **Vue `Teleport` 的局限性**：`Teleport` 是**物理层面的 DOM 搬家工具**，而非逻辑层面的组织者。它死绑硬编码的 CSS 选择器（摧毁复用性），不支持作用域插槽（Scoped Props），且在找不到目标 DOM 节点时会发生**崩溃抛错**，无法做到优雅的降级。

### 1.2 远程出口的定位

> **远程出口（Remote Outlet）是一个逻辑层的 VNode 级布局原语。它允许开发者在子树里用声明式语法编写高内聚的业务逻辑与 UI 块，实际作为远端宿主的具名插槽来渲染。**

---

## 2. 核心判定矩阵（防滥用铁律）

为防止团队将“远程出口”泛滥为全局事件总线或面条代码，定死以下判别矩阵：

| 异地渲染诉求 | 它是数据（Data）还是动作（Action）？ | 核心依赖 | 推荐解法 |
| --- | --- | --- | --- |
| **动态面包屑 / 网页标题** | 纯元数据（字符串/对象数组） | 依赖全局上下文状态 | **状态提升 / 路由 Meta 驱动**<br>

<br>*(上远程出口 $\rightarrow$ **过度设计**)* |
| **工具栏 / 弹层底栏按钮** | 强交互动作（触发本地校验、触发私有弹窗） | 强依赖子组件内部的**私有闭包变量** | **远程出口 (`vue-outlet`)**<br>

<br>*(上状态提升 $\rightarrow$ **破坏封装**)* |

> ⚠️ **防穿透原则**：远程出口只允许发送「自包含逻辑的 UI 块」，绝不允许在外壳中为它编写定制的胶水代码。子组件投递的按钮，其生命周期与副作用完全由子组件自己买单。

---

## 3. 架构设计与核心机制

### 3.1 逻辑架构图

```text
  [ 外壳侧 / 宿主方 ]                      [ 业务侧 / 贡献方 ]
  +------------------+                   +--------------------+
  |   DetailShell    |                   |    UserProfile     |
  |                  |    Inject Key     |                    |
  |   +----------+   | <===============  |   +------------+   |
  |   |  Outlet  |   |   (配对隔离通道)   |   | Contribute |   |
  |   +----------+   |                   |   +------------+   |
  +--------|---------+                   +---------|----------+
           |                                       |
           +============[ VNode 级闭包渲染 ]========+
                    (支持 Scoped Props 动态透传)

```

### 3.2 核心特性机制

1. **隔离配对工厂（`createOutlet`）**：通过工厂函数生成独立的 `InjectionKey`，防止全局命名空间冲突。详情页底栏通道与弹窗底栏通道即使都叫 `actions`，也互不干扰。
2. **环境自适应（优雅降级）**：`<Contribute>` 组件挂载时若发现上层上下文中无匹配的宿主通道，会**自动保持沉默，不渲染任何 DOM**，子组件主正文功能完全不受影响，完美支持无壳复用。
3. **响应式依赖收集**：内部基于 Vue 的响应式系统（`shallowRef` 映射表）驱动，宿主通过 `has(name)` 动态感知是否有贡献方存在，从而自适应控制外壳的显示与隐藏（避免留白占位）。

---

## 4. API 规范提案

### 4.1 声明与配对（以详情页底栏为例）

```ts
// src/outlets/detail-bar.ts
import { createOutlet } from 'vue-outlet'

// 每个隔离布局通道独立导出一对 Hooks
export const { useOutlet, useContribute } = createOutlet()

```

### 4.2 宿主侧（Host / Outlet）

```vue
<!-- DetailShell.vue (外壳组件) -->
<script setup lang="ts">
import { useOutlet } from '@/outlets/detail-bar'

// Outlet: 具名出口组件; has: 响应式判断指定插槽是否有内容输入
const { Outlet, has } = useOutlet()
</script>

<template>
  <div class="layout-shell">
    <main><router-view /></main>
    
    <!-- 只有当子页面确实投递了内容时，才渲染外壳，避免留白占位 -->
    <footer v-if="has('actions')" class="detail-action-bar">
      <!-- 顺畅透传宿主环境的状态给贡献方 -->
      <Outlet name="actions" :shell-size="'compact'" />
    </footer>
  </div>
</template>

```

### 4.3 贡献方（Contributor / Contribute）

```vue
<!-- UserProfile.vue (高内聚的业务组件) -->
<script setup lang="ts">
import { ref } from 'vue'
import { Contribute } from 'vue-outlet'
import { useContribute } from '@/outlets/detail-bar'
import MyDialog from './MyDialog.vue'

const to = useContribute() // 注入配对通道的 Handle
const form = ref({ name: '' })
const dialogVisible = ref(false)

const handleSave = async () => {
  // 直接读取本地私有 ref，闭包逻辑极其自然
  await api.save(form.value)
}
</script>

<template>
  <div class="form-core">
    <input v-model="form.name" />
    
    <!-- 弹窗内聚在组件内部，作用域完美闭包 -->
    <MyDialog v-model="dialogVisible" />
  </div>

  <!-- 远程投递原语：通过 :to 绑定通道，若环境无宿主则自动静默降级 -->
  <Contribute :to="to" name="actions" v-slot="{ shellSize }">
    <button :class="shellSize" @click="dialogVisible = true">新建关联</button>
    <button :class="shellSize" type="primary" @click="handleSave">保存</button>
  </Contribute>
</template>

```

### 4.4 对接命令式弹层（以 `vue-layerx` 为例）

针对非标准祖先树的命令式挂载场景，`Contribute` 支持直接通过 `:to` 传入显式实例：

```vue
<!-- 弹层内部的业务组件 -->
<script setup lang="ts">
import { Contribute } from 'vue-outlet'
import { useDialogInstance } from 'vue-layerx'

const dialog = useDialogInstance() // 拿到当前弹层实例的 Handle
</script>

<template>
  <div class="dialog-content">业务内容...</div>
  
  <!-- 显式投递到指定的弹层实例的具名出口处 -->
  <Contribute :to="dialog" name="footer">
    <button @click="dialog.close()">取消</button>
  </Contribute>
</template>

```

---

## 5. 命名与概念对照表

| 概念/技术用语 | 建议正式名 | 职责定义 |
| --- | --- | --- |
| **`createX`** | `createOutlet` | 通道配对工厂，生成隔离的 Injection 上下文 |
| **`useInParent`** | `useOutlet` | 宿主侧 Hook，负责提供出口组件与响应式状态检测 |
| **`useInChild`** | `useContribute` | 贡献侧 Hook，负责获取隐式配对通道的 Handle |
| **`SlotPlaceholder`** | `Outlet` | 远端插槽占位组件，负责在宿主侧物化并渲染 VNode |
| **`LayerTemplate`** | `Contribute` | 核心贡献方原语（`vue-layerx` 内可作为别名包装保留） |

---

## 6. 实施演进策略

1. **第一阶段：内核提取（无断裂重构）**：在 `vue-layerx` 内部优先重构，将 `layer-template-to.ts` 沉淀为纯粹的 `OutletHandle` 协议层，剥离所有 Layer 业务语义。
2. **第二阶段：双场景跑通（局部验证）**：在主业务项目中，手写 `DetailShell` 工具栏/底栏 demo，不引入 layerx，完全基于这套原语跑通跨路由投递，验证**环境自适应降级**与 **Scoped Props** 的稳定性。
3. **第三阶段：物理拆包**：API 冻结并确立 ADR 后，正式抽离为独立 Workspace 模块 `packages/vue-outlet`。