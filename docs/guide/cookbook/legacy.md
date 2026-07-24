<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/legacy/App.vue'
import AppSource from '../../examples/legacy/App.vue?raw'
import DialogSource from '../../examples/legacy/UserDialog.vue?raw'
import FormSource from '../../examples/legacy/UserForm.vue?raw'
</script>

# 未拆分内容/容器弹窗接入

老项目里常见「一个 `.vue` 里已经写好了 `<el-dialog>` + 表单」。新用户可先看指南里更简单的写法：[容器与内容未拆分](/guide/no-container)（内容里 `defineLayer({ component: LayerNoContainer })`）。

本页 Demo：同一 `useLayer` 混用单体与已拆分 content——adapter 按组件换成 `LayerNoContainer`；拆出纯表单后，调用方的 `open({ props })` 尽量不动。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'UserDialog.vue（单体）', code: DialogSource },
    { name: 'UserForm.vue（已拆分）', code: FormSource },
  ]"
/>

```ts
const useLayer = createLayer(ElDialog, {
  adapter: (f) =>
    isMonolith(f.content?.component)
      ? { ...f, container: { ...f.container, component: LayerNoContainer } }
      : f,
})
useLayer(UserDialog) // LayerNoContainer + props 投影，不再外套一层 Dialog
useLayer(UserForm)   // 普通容器 + 内容
```

建模说明见[容器与内容未拆分](/guide/no-container)。
