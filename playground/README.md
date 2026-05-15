# vue-layerx playground

Vite + Vue 3 + TypeScript + Element Plus，演示 `createLayers(ElDialog)` 的用法。

## 运行

在仓库根目录：

```bash
pnpm playground
# 或
cd playground && pnpm dev
```

## 示例结构

- `src/layers.ts` — 仅 `createLayers(ElDialog)`，导出 `useDialog`
- `src/components/UserList.vue` — 在 `setup` 内 `useDialog(CreateForm, …)`，命令式 `show()`
- `src/components/CreateForm.vue` — 弹层内表单，`success` / `cancel` 触发关闭

`vite.config.ts` 将 `vue-layerx` alias 到 `../src`，改库源码可热更新。
