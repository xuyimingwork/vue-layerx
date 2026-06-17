# vue-layerx

Vue 3 弹层工厂：**内容组件**（UserDetail / UserForm）与 **壳**（BaseDialog）分离，业务页 `show()` 一行。

```
列表详情  = useDetailLayer(UserDetail).show({ props: row })
订单嵌入  = <UserDetail v-bind="user" />          // 同一组件
编辑      = useEditLayer(UserForm).show({ props })
窄屏详情  = adapt 在 useDetailLayer 里换 Drawer   // 业务页不用 if/else
```

## 对比传统写法

| | 传统 | vue-layerx |
|---|------|------------|
| 列表详情 | 列表页 `el-dialog` + `v-model` + footer | `detailLayer.show({ props: row })` |
| 订单展示 | 再写一份详情或加 `inDialog` prop | 直接 `<UserDetail />` |
| 窄屏 Drawer | 业务页 `if (mobile)` 两套 show | `useDetailLayer` 的 `adapt` |
| createLayer | 每次写 defaults | `createLayer(BaseDialog)` 配置在壳里 |

## 快速开始

```ts
// BaseDialog.vue — width、destroyOnClose 等默认值在这里
export const useEditLayer = createLayer(BaseDialog)
export const useDetailLayer = createLayer(BaseDialog, {}, detailAdapt)
```

```vue
<!-- UserDetail.vue -->
<script setup>
defineLayer({ props: { title: '用户详情' } })
</script>
```

```ts
// UserList.vue
detailLayer.show({ props: row })
```

```vue
<!-- OrderDetail.vue -->
<UserDetail :name="..." :email="..." />
```

## 文档

```bash
pnpm docs:dev   # §1–§6 渐进教程
```

## 开发

```bash
pnpm install && pnpm test && pnpm build
pnpm docs:dev
pnpm playground
```
