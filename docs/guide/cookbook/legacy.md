<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/legacy/App.vue'
import AppSource from '../../examples/legacy/App.vue?raw'
import DialogSource from '../../examples/legacy/UserDialog.vue?raw'
import FormSource from '../../examples/legacy/UserForm.vue?raw'
</script>

# 未拆分内容/容器弹窗接入

老项目里常见「一个 `.vue` 里已经写好了 `<el-dialog>` + 表单」。短期内拆不开时，用 `LayerNoContainer` 先命令式打开整颗组件；拆出纯表单后，同一 `useLayer` 仍可打开已拆分的 content——调用方的 `open({ props })` 尽量不动。

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
useLayer(UserDialog) // 透明壳 + props 投影，不再外套一层 Dialog
useLayer(UserForm)   // 正常壳 + 内容
```

建模说明见[容器与内容未拆分](/guide/no-container)。
