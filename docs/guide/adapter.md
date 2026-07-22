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

也可以在这里根据合并结果做改名、删字段等（例如把 `width` 挪成另一个壳的 `size`）。页内与 Dialog / Drawer 共用同一内容的例子见 [复用内容组件](/guide/cookbook/content-reuse)。

老弹窗还没拆开、又想和已拆好的内容共用同一个 `useDialog` 时，也可以在 `adapter` 里换成 `LayerNoContainer`，见 [壳与内容未拆分](/guide/no-container) 与 [未拆分内容/容器弹窗接入](/guide/cookbook/legacy)。

## 和 open 里改配置怎么选

- 只影响这一次 → `open({ … })` 或 `useDialog(内容, { … })`  
- 没有人写时的默认 → `createLayer` 第二参的 `props`  
- 合并完仍要按项目约定改掉 → `adapter`

## 下一步

[SSR 与限制](/guide/ssr)
