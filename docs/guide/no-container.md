<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/no-container/App.vue'
import AppSource from '../examples/no-container/App.vue?raw'
import DefineSource from '../examples/no-container/MonolithDefine.vue?raw'
import FactorySource from '../examples/no-container/MonolithFactory.vue?raw'
</script>

# 容器与内容未拆分

目标用法是 **容器组件 + 内容组件** 分开：外面 `ElDialog`，里面 `UserForm`。

老项目里却常见「一个 `.vue` 里已经写好了 `<el-dialog>` + 表单」。短期内拆不开时：**整颗旧组件仍当作内容组件**，用 `LayerNoContainer` 表示外面不要再包一层 Dialog。

## 推荐做法：`defineLayer` 自报

契约写在内容文件里（自包含），调用方仍是普通的 `useDialog`：

```vue
<!-- UserDialog.vue：内部已有 el-dialog -->
<script setup lang="ts">
import { defineLayer, LayerNoContainer } from 'vue-layerx'

defineLayer({
  component: LayerNoContainer,
  content: { closeOn: ['success'] },
})

defineProps<{ modelValue?: boolean; id?: number }>()
defineEmits<{ 'update:modelValue': [boolean]; success: [] }>()
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- 原有表单… -->
  </el-dialog>
</template>
```

```ts
export const useDialog = createLayer(ElDialog)
const userDialog = useDialog(UserDialog)
userDialog.open({ props: { id: 1 } })
```

## 为何工厂仍是 `ElDialog` 也能用

配置合并里 [defineLayer 高于 createLayer](/guide/config-merge)，内容里的 `component: LayerNoContainer` 会盖过工厂默认容器。

> 打开时可能先按工厂的 `ElDialog` 走一帧，再换成内容声明的 `LayerNoContainer`（与普通换容器同树，可 park）。多数情况下**观感无差**；下方 Demo 用「内容 setup 次数」帮你对照。
>
> 若介意这一帧，或希望打开前就定好容器，用 `createLayer(LayerNoContainer)`（Demo 的 B）。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'MonolithDefine.vue（A）', code: DefineSource },
    { name: 'MonolithFactory.vue（B）', code: FactorySource },
  ]"
/>

- **A**：`createLayer(ElDialog)` + 内容里 `defineLayer({ component: LayerNoContainer })`（推荐、自包含）  
- **B**：`createLayer(LayerNoContainer)`，打开前就定容器  

## 单体要接 `modelValue`

`LayerNoContainer` 不会再套一层 Dialog，但框架仍会把容器侧 props（含可见性用的 `modelValue`）**投影到内容组件上**。单体需要自己声明并接到内部的 `el-dialog`（见上例），否则弹层开关对不上。

## 拆分完成后

删掉（或改掉）`component: LayerNoContainer`，内容只留纯表单；调用方的 `useDialog(…)` / `open({ props })` 可以尽量不动。

## 不要当成「仅容器、不传内容 / 把单体当容器」

| 情况 | 正确理解 | 怎么写 |
|------|----------|--------|
| **容器与内容还粘在一起**（本页） | 单体始终是 **内容组件** | 内容里 `defineLayer({ component: LayerNoContainer })` |
| **只要容器、暂时没有业务体** | 仍是「有容器」；内容可以不绑 | `useDialog()` 不传 Content，容器配置走 `container:`（见 [打开与关闭](/guide/open-close#可以不传内容组件)） |

不要用 `createLayer(UserDialog)` 或把单体放在容器侧：以后拆分时角色必须是「`UserForm` = 内容组件」，一开始当容器迁移方向反了，也不会按「无外层 Dialog + 单体做内容」去投影 props。

## 其他选定容器的方式（可选）

日常优先 **A（defineLayer）**。同一工厂既开单体又开已拆分的 `UserForm` 时，可在 [adapter](/guide/adapter) 里按内容组件换成 `LayerNoContainer`——带 Demo 见 [未拆分内容/容器弹窗接入](/guide/cookbook/legacy)。

设计细节见 [ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。

## 下一步

[SSR 与限制](/guide/ssr)。需要同一工厂混用单体与已拆分内容时，见实践 [未拆分内容/容器弹窗接入](/guide/cookbook/legacy)。
