# 简介

vue-layerx 让你用**命令式**打开业务弹层，同时继续使用项目里已有的 Dialog / Drawer / Popup，不必换壳、也不必为引库自建一套弹窗。

```ts
const useDialog = createLayer(ElDialog)
const dialog = useDialog(UserForm)
dialog.open({ props: { id: 1 } })
```

## 解决什么问题

中大型 Vue 项目里，弹层一多就会同时出现：

- 页面里堆 `visible` + `<ElDialog>` 样板
- 内容组件和某一种壳写死在一起，换 Drawer / 页内复用很痛
- 想命令式 `open()`，又不愿全员改写 JSX 填插槽

vue-layerx 对准的是这一档需求：**编排「容器 × 内容」**，而不是再做一个弹窗 UI 库。

## 核心模型

| 角色 | 是什么 | 例子 |
|------|--------|------|
| **容器** | 靠 v-model 控制显隐、通常有 default slot 的组件 | `ElDialog`、`VanPopup`、项目 `BaseDialog` |
| **内容** | 普通业务组件 | `UserForm`、`HelloWorld` |
| **工厂** | `createLayer(容器)` 返回的组合式函数 | `useDialog`、`useDrawer` |
| **实例** | `useDialog(内容)` 的返回值 | `open` / `close` / `visible` |

内容按普通 Vue 组件来写（props in / emits out）；关层由外侧 `closeOn` 接线，而不是在内容里调 `close()`。

## 和「自带壳」方案的差别

| | vue-layerx | 自带壳的弹窗库 |
|--|------------|----------------|
| 壳 | 你们正在用的组件库 | 库自己的 Modal |
| 插槽 | `LayerTemplate`，继续写 template | 常见要写 JSX / render |
| 内容 | 可页内复用 | 往往弹层专用 |

## 文档怎么读

1. [快速上手](/guide/quick-start) — 装上并打开第一个弹层
2. **基础** — 工厂、打开关闭、`defineLayer`、`closeOn`、`LayerTemplate`
3. **进阶** — 配置合并、响应式、adapter、实例、SSR
4. [API](/api/) — 查签名与类型
5. （可选）[实践教程](/guide/cookbook/) — 用一个 UserForm 串起详情 / 编辑 / 适配

本地可跑 Playground（导航栏入口）对照示例。
