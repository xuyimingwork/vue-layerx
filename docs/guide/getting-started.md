# 搭建 BaseDialog

## 默认配置放进壳组件

宽度、`destroyOnClose`、`appendToBody` 写在 **BaseDialog** 里——`createLayer` 只传组件：

```vue
<!-- BaseDialog.vue -->
<script setup lang="ts">
withDefaults(defineProps<{ width?: string }>(), { width: '480px' })
</script>

<template>
  <ElDialog :width="width" destroy-on-close append-to-body ...>
    <slot />
    <template #footer>
      <ElButton @click="emit('update:modelValue', false)">关闭</ElButton>
      <slot name="footer" />
    </template>
  </ElDialog>
</template>
```

## createLayer 一行

```ts
// layers/index.ts
export const useEditLayer = createLayer(BaseDialog)

export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)
```

`createLayer` 默认显隐协议 `modelValue` / `onUpdate:modelValue`，**第二个参数可以省略**。

- **useEditLayer** — 新建/编辑表单
- **useDetailLayer** — 列表详情；第三个参数 `adapt` 在 §5 展开（窄屏换 Drawer）

## 下一步

[§1 列表详情弹层](/guide/detail)
