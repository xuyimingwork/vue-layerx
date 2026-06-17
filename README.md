# vue-layerx

一个 **UserForm** + 一个 **useDetailLayer**：

```
view   → disabled 表单（列表详情 / OrderDetail 嵌入）
edit   → useDetailLayer.show({ mode: 'edit' })
create → useDetailLayer.show({ mode: 'create' })
窄屏   → adapt 换 Drawer（仍是 useDetailLayer）
```

## 对比

| | 传统 | vue-layerx |
|---|------|------------|
| 详情 vs 编辑 | 两个 dialog 或组件 | 同一 UserForm，`mode` + disabled |
| 工厂 | useDialog + useEditDialog? | **仅 useDetailLayer** |
| OrderDetail | 另一份 Descriptions | `<UserForm mode="view" />` |
| 窄屏 | 业务页 if (mobile) | adapt |

```ts
export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)
```

```ts
userLayer.show({ props: { mode: 'view', ...row } })
userLayer.show({ props: { mode: 'edit', onSubmit: fn } })
```

```vue
<UserForm mode="view" :initial-name="user.name" />
```

```bash
pnpm docs:dev
```
