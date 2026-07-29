# Vue 2.7 兼容说明

`vue-layerx@1.1+` 同包支持 **Vue 2.7** 与 **Vue 3.3+**（`peerDependencies`: `^2.7 || ^3.3`）。公开 API 同名同形；行为差见下。

> **best-effort**：Vue 2 已 EOL，本适配无 SLA，仅保证关键路径与入口可解析（见 ADR 0008）。

## 安装

```bash
pnpm add vue-layerx
# peer: vue@^2.7 或 vue@^3.3
```

```ts
import { createLayer } from 'vue-layerx'
```

不要使用子路径（无 `vue-layerx/vue2`）。应用侧请 **dedupe** `vue`，避免双副本导致 provide / 全局插件丢失。

## 与 Vue 3 的主要差异

| 场景 | Vue 3 | Vue 2.7 |
|------|-------|---------|
| 默认容器 `model` | `modelValue` + `update:modelValue` | `value` + `input`（其它名仍走 `update:${model}`） |
| 打开后换 `container.component` | Teleport park，content 可保留 | **无 Teleport** → 嵌套 diff **自然 remount**，content 状态丢失 |
| `LayerNoContainer` | 同构 Teleport + props 投影 | 扁平 `h(content)` + **同样全投影** |
| Host / provide | `createApp` + `appContext` 桥接 | 宿主 `Vue.extend` + `parent: proxy` |
| 内部树 | Teleport → 容器 default 锚点 | content 直接在容器 default 插槽 |

日常 `open` / `close` / `confirm` / `defineLayer` / `LayerTemplate` / `bindHost` 在正确配置 `model` 与容器的前提下，体感应基本一致。

## 容器 model

默认与 Vue 3 对齐：Vue 3 → `modelValue`；Vue 2.7 → `value`（flat 更新键 `onInput` → 平台 `input`）。Element UI Dialog 等用 `visible` 时需显式声明：

```ts
// Vue 2.7 默认（可省略）
const usePopup = createLayer(MyPopup)

// Element UI Dialog
const useDialog = createLayer(ElDialog, { model: 'visible' })
```

## append-to-body

与 Vue 3 + Element Plus 相同：容器若 `append-to-body`，会出现 body 上双挂（LayerApp 根 + Dialog 传送），可接受；一般无感。

## 官方示例

```bash
pnpm demos:vue2   # Vue 2.7 + Element UI，默认 :5174
pnpm demos        # Vue 3 + Element Plus，默认 :5173
```

见仓库 `demos-vue2/`（`model: 'visible'`、LayerTemplate、confirm）与 `demos-vue3/`。文档站导航 **Demos** 可打开已部署版本（`/demos/vue2/`、`/demos/vue3/`）。

## 测试

```bash
pnpm build
pnpm test:integration:vue2   # dist 门禁（关键路径）
```

详见 [TESTING.md](https://github.com/xuyimingwork/vue-layerx/blob/main/TESTING.md)。
