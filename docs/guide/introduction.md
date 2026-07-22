<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/intro/App.vue'
</script>

# 简介

vue-layerx 让你用**命令式**打开业务弹层，同时继续使用项目里已有的 Dialog / Drawer / Popup——不必换掉现有弹层容器，也不必为引库再造一套弹窗。

```ts
const useDialog = createLayer(ElDialog)
const dialog = useDialog(HelloWorld)
dialog.open()
```

<DemoBlock :demo="Demo" preview-only />

## 解决什么问题

弹层一多，页面容易堆 `visible` 样板；内容和 Dialog / Drawer 写死在一起后，换容器、页内复用都很痛。

vue-layerx 不替换你们的组件库，也不另造一套 Modal——只提供命令式 API，把「弹层壳」和「业务内容」拆开编排。不必换栈。

若壳和表单暂时还粘在一个 `.vue` 里，不必先大拆，见 [容器与内容未拆分](/guide/no-container)。

## 核心概念

一次弹层由两个角色组成：

| | 职责 | 例子 |
|--|------|------|
| **容器（container）** | 显隐、遮罩、标题栏等壳 | `ElDialog`、`ElDrawer`、项目内 `BaseDialog` |
| **内容（content）** | 普通业务组件，可页内复用 | `HelloWorld`、`UserForm` |

对应到 API：

```text
createLayer(容器)  →  useDialog(内容)  →  instance.open()
       ↑                    ↑
   配容器默认           配内容 / 当次打开
```

## 接下来

从 [快速上手](/guide/quick-start) 开始安装并打开第一个弹层，再按侧栏读基础与进阶。需要查签名看 [API](/api/)；按场景查阅看 [实践](/guide/cookbook/)。本地也可对照导航栏里的 **Playground**。
