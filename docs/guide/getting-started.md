# 搭建 BaseDialog

默认配置在 **BaseDialog** 里 → `createLayer` 只传组件：

```ts
export const useDetailLayer = createLayer(BaseDialog, { adapter: detailAdapt })
```

- 详情 / 编辑 / 新建共用 **`useDetailLayer`**
- `detailAdapt` 在 §5 展开（窄屏 Dialog → Drawer）
- 不需要 `useEditLayer`

[§1 列表详情](/guide/detail)
