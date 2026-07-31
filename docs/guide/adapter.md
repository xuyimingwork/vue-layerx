<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/legacy/App.vue'
import AppSource from '../examples/legacy/App.vue?raw'
import DialogSource from '../examples/legacy/UserDialog.vue?raw'
import FormSource from '../examples/legacy/UserForm.vue?raw'
</script>

# 用 adapter 统一改配置

> 多数业务页作者可以跳过本章。一般是维护 `composables/dialog.ts` 这类文件时才需要。

前面写过：配置会从 `createLayer`、`defineLayer`、`open` 等处叠在一起，[越靠后的优先级越高](/guide/config-merge)。

所以如果只在 `createLayer` 里写 `props: { closeOnClickModal: false }`，那只是默认值——后面某次 `open` 写成 `true`，仍然会变成 `true`。

有时项目要的不是默认，而是**最后结果必须如此**（谁写了都不算）。这时可以给 `createLayer` 加一个 `adapter`：等各处配置都合并完，再把结果交给你改一改，改完才拿去显示。业务页照常 `open()`。

```ts
import type { LayerAdapter } from 'vue-layerx'
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

const enforceMaskNotClosable: LayerAdapter = (config) => ({
  ...config,
  container: {
    ...config.container,
    props: {
      ...config.container?.props,
      closeOnClickModal: false, // 写在后面：合并完再钉死
    },
  },
})

export const useDialog = createLayer(ElDialog, {
  adapter: enforceMaskNotClosable,
})
```

也可以在这里根据合并结果做改名、删字段等（例如把 `width` 挪成另一个容器的 `size`；或按屏宽换 Dialog / Drawer）。页内与弹层共用同一内容、用 `visible-outside` 适配操作区，见实践 [综合案例](/guide/cookbook/form-workflow)。

## 和 open 里改配置怎么选

- 只影响这一次 → `open({ … })` 或 `useDialog(内容, { … })`
- 没有人写时的默认 → `createLayer` 第二参的 `props`
- 合并完仍要按项目约定改掉 → `adapter`

## 同一工厂通吃单体与已拆分内容

老弹窗还是「一个文件里 `<el-dialog>` + 表单」、又想和已拆好的 content 共用同一个 `createLayer(ElDialog)` 时：在 `adapter` 里识别单体，把容器换成 `LayerNoContainer`，避免再套一层 Dialog。调用方仍是 `useLayer(…)` / `open({ props })`，拆分前后尽量不动。

更简单、内容自报「不要外层容器」的写法见 [容器与内容未拆分](/guide/no-container)（`defineLayer({ component: LayerNoContainer })`）。下面 Demo 展示的是 **工厂侧用 adapter 混用** 两种内容：

```ts
const useLayer = createLayer(ElDialog, {
  adapter: (f) =>
    isMonolith(f.content?.component)
      ? { ...f, container: { ...f.container, component: LayerNoContainer } }
      : f,
})
useLayer(UserDialog) // LayerNoContainer + props 投影，不再外套一层 Dialog
useLayer(UserForm)   // 普通 ElDialog + 内容
```

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'UserDialog.vue（单体）', code: DialogSource },
    { name: 'UserForm.vue（已拆分）', code: FormSource },
  ]"
/>

## 下一步

容器与表单还粘在一起、且希望内容自己声明时，见 [容器与内容未拆分](/guide/no-container)；否则可看 [SSR 与限制](/guide/ssr)。
