<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/no-container/App.vue'
import AppSource from '../examples/no-container/App.vue?raw'
import DefineSource from '../examples/no-container/MonolithDefine.vue?raw'
import FactorySource from '../examples/no-container/MonolithFactory.vue?raw'
</script>

# 容器与内容未拆分

若项目里已经是「一个文件里 Dialog + 表单」：

```vue
<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form><!-- 原逻辑 --></el-form>
  </el-dialog>
</template>
```

短期内拆不开时：整颗组件仍当作**内容组件**，用 `LayerNoContainer` 表示外面不要再包一层 Dialog。

## 通过 `defineLayer` 配置

在组件里配置一下即可。调用方仍是普通的 `useDialog(UserDialog)`，和已拆分的 content **用法无区别**：

```vue
<script setup lang="ts">
import { defineLayer, LayerNoContainer } from 'vue-layerx'

defineLayer({
  component: LayerNoContainer,
  content: { closeOn: ['success'] },
})

// 原 props / emits / 表单逻辑…
</script>

<template>
  <!-- 原 el-dialog + 表单，不变 -->
</template>
```

```ts
export const useDialog = createLayer(ElDialog)
const userDialog = useDialog(UserDialog)
userDialog.open({ props: { id: 1 } })
```

配置合并里 [defineLayer 高于 createLayer](/guide/config-merge)，内容里的 `component: LayerNoContainer` 会盖过工厂默认容器。

> 因时序：内容挂载后 `defineLayer` 才生效，打开时会先渲染外界已定的容器（`create` / `use` / `open`），再换成 `LayerNoContainer`（同构可 park，内容通常不必二次 setup）。多数情况下观感无差。

对照 **A**（`defineLayer` 自报）与 **B**（打开前就定好 `LayerNoContainer`）。下方「内容 setup 次数」在每次内容挂载时 +1；同构换容器后两者通常都是每次打开 +1。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'MonolithDefine.vue（A）', code: DefineSource },
    { name: 'MonolithFactory.vue（B）', code: FactorySource },
  ]"
/>

- **A**：工厂仍是 `ElDialog`，内容里 `defineLayer({ component: LayerNoContainer })`——调用方与普通 content 一致  
- **B**：`createLayer(LayerNoContainer)`——打开前定容器（见下一节）  

## 大量同类单体：专属无容器组合式函数

也可以使用专属的组合式函数：利用 `createLayer(LayerNoContainer)` —— 打开前就定好容器：

```ts
export const useMonolithDialog = createLayer(LayerNoContainer)
const userDialog = useMonolithDialog(UserDialog)
```

## 个例且要避开首帧：在 use 上指定

个别弹层既要无外层 Dialog，又希望打开前就定容器时，在实例配置里写：

```ts
const userDialog = useDialog(UserDialog, {
  container: { component: LayerNoContainer },
})
```

当次 `open({ container: { component: LayerNoContainer } })` 同理。

## 显隐如何对上内部 Dialog

平时框架按 `model`（默认 `modelValue`）把可见性绑在**容器**上。换成 `LayerNoContainer` 后外面没有 Dialog 了，同一套 props 会**投影到内容组件**；内容若是单根 `el-dialog`，一般再靠属性继承落到内部 Dialog。

因此内部 Dialog 用的显隐字段，需要和当前生效的 `model` **同名**（默认即 `v-model` / `modelValue`）。打不开、关不掉时，优先查是不是名字对不上。

若单体内部用的是别的名字（例如 `v-model:visible`），而工厂仍是默认 `modelValue`，可在内容里再声明一次：

```ts
defineLayer({
  component: LayerNoContainer,
  model: 'visible', // 与内部 Dialog 一致
})
```

也可在 `createLayer` / `use` 上改 `model`，规则见 [创建弹层组合式函数](/guide/create-layer#显隐字段不叫-modelvalue-时)。

## 不要当成「仅容器、不传内容 / 把单体当容器」

| 情况 | 正确理解 | 怎么写 |
|------|----------|--------|
| **容器与内容还粘在一起**（本页） | 单体始终是 **内容组件** | 内容里 `defineLayer({ component: LayerNoContainer })`，或上文的工厂 / `use` 写法 |
| **只要容器、暂时没有业务体** | 仍是「有容器」；内容可以不绑 | `useDialog()` 不传 Content，容器配置走 `container:`（见 [打开与关闭](/guide/open-close#可以不传内容组件)） |

不要用 `createLayer(UserDialog)` 或把单体放在容器侧：以后拆分时角色必须是「`UserForm` = 内容组件」，一开始当容器迁移方向反了，也不会按「无外层 Dialog + 单体做内容」去投影 props。

正因一开始就把单体当内容组件，日后拆成纯表单时去掉 `LayerNoContainer`（以及外层 `el-dialog`）即可，调用方的 `useDialog` / `open` 可以尽量不动。

## 同一工厂混用单体与已拆分内容

需要同一个 `createLayer(ElDialog)` 既开单体又开已拆分的 `UserForm` 时，可在 [adapter](/guide/adapter) 里按内容组件换成 `LayerNoContainer`——带 Demo 见 [未拆分内容/容器弹窗接入](/guide/cookbook/legacy)。

设计细节见 [ADR 0001](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0001-legacy-monolith-progressive-adoption.md)。

## 下一步

[SSR 与限制](/guide/ssr)。
