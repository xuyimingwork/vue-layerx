# 壳与内容未拆分

目标用法是 **容器 + 内容** 分开：外面是 `ElDialog`，里面是 `UserForm`。

老项目里却常见「一个 `.vue` 里已经写好了 `<el-dialog>` + 表单」——**壳和业务还粘在一起**。短期内拆不开文件时，可以用 `LayerNoContainer` 先命令式打开这整颗组件，再慢慢拆。

## 做法：整颗旧组件当作「内容」

```ts
import { createLayer, LayerNoContainer } from 'vue-layerx'
import UserDialog from './UserDialog.vue' // 内部已有 el-dialog

export const useUserDialog = createLayer(LayerNoContainer)
const userDialog = useUserDialog(UserDialog)
userDialog.open({ props: { id: 1 } })
```

`LayerNoContainer` 的意思是：**框架不再外面再包一层容器**，只渲染你传入的那颗组件（拍平为 `h(UserDialog)`）。  
所以这里的「内容」其实是整颗旧弹窗；等拆出纯 `UserForm` 后，把 `createLayer(LayerNoContainer)` 换成 `createLayer(ElDialog)` 即可，调用方的 `open({ props })` 可以尽量不动。

也可用同一个 `createLayer(ElDialog)`，在 `adapter` 里遇到单体组件时再把容器换成 `LayerNoContainer`，与已拆分的内容共用一个组合式函数——见 [未拆分内容/容器弹窗接入](/guide/cookbook/legacy) 与 [ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。

## 为什么不是「只有容器、没有内容」？

容易想到：`createLayer(UserDialog)` 或 `useDialog()` 不传内容，把单体放在容器侧。**不要这么建模。**

| 情况 | 正确理解 | 怎么写 |
|------|----------|--------|
| **壳和内容还粘在一起**（本页） | 单体始终是 **content**；用 `LayerNoContainer` 表示外面没有第二层壳 | `createLayer(LayerNoContainer)(UserDialog)` |
| **只要空壳、暂时没有业务体** | 仍是「有容器」；内容可以不绑 | `useDialog()` 不传 Content，壳的配置走 `container:` |

空壳示例：

```ts
const shell = useDialog()
shell.open({
  container: { props: { title: '仅外壳', width: '480px' } },
})
```

原因简要说：

1. 以后拆分时，角色必须是「`UserForm` = 内容」；一开始就把单体当成容器，迁移方向反了。  
2. `createLayer(UserDialog)` 仍会走「容器里再塞内容」的路径，并不会按「整颗就是弹窗」去拍平。  
3. 「不传 Content」是另一种合法用法（空壳），和「未拆分的单体」不是一回事——见 [打开与关闭 · 可以不传内容组件](/guide/open-close#可以不传内容组件)。

框架也没有对称的 `LayerNoContent`：空壳时把配置写在 `container:` 即可，不必再发明一套反向拍平。

## 拆分完成后

把组合式函数改回真正的壳，内容只保留表单：

```ts
export const useDialog = createLayer(ElDialog)
const userLayer = useDialog(UserForm)
```
