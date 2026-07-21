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

## 先记住两个角色

| 角色 | 是什么 | 例子 |
|------|--------|------|
| **容器** | 控制显隐的外壳组件 | `ElDialog`、`VanPopup`、项目里的 `BaseDialog` |
| **内容** | 普通业务组件 | `UserForm`、`HelloWorld` |

用法上再多两步：

1. `createLayer(容器)` → 得到组合式函数，如 `useDialog`
2. `useDialog(内容)` → 得到实例，再 `open()` / `close()`

内容仍按普通 Vue 组件来写（props 进来、emit 出去）；怎么关弹层、怎么填 footer，后面几章再展开。

## 和「自带壳」方案的差别

| | vue-layerx | 自带壳的弹窗库 |
|--|------------|----------------|
| 壳 | 你们正在用的组件库 | 库自己的 Modal |
| 插槽 | 继续用模板写 | 常见要写 JSX / render |
| 内容 | 可以页内复用 | 往往只能当弹层用 |

## 文档怎么读

1. [快速上手](/guide/quick-start) — 装上并打开第一个弹层  
2. **基础** — 从组合式函数、打开关闭，再到内容默认配置、关层、插槽  
3. **进阶** — 配置合并、响应式、换容器、实例细节、SSR  
4. [API](/api/) — 查签名与类型  
5. （可选）[实践教程](/guide/cookbook/) — 用一个 UserForm 串完整业务故事  

本地可跑导航栏里的 **Playground** 对照示例。
