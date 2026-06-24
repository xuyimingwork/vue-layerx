# 为什么需要 vue-layerx

## 一个 UserForm，三种 mode

真实项目里**不会**拆 `UserDetail` + `UserForm`，也不会注册 `useEditLayer`：

```vue
<!-- UserForm.vue -->
<ElInput v-model="name" :disabled="mode === 'view'" />
```

| mode | 场景 | 表现 |
|------|------|------|
| `view` | 列表点行看详情、OrderDetail 嵌入 | 表单 disabled，无保存按钮 |
| `edit` | 列表点编辑 | 可编辑 + footer 保存 |
| `create` | 列表新建 | 同上 |

**一个工厂 `useDetailLayer(UserForm)`** 覆盖详情、编辑、新建；窄屏 `adapt` 换 Drawer。

## 传统 vs vue-layerx

**传统：**

```vue
const detailVisible = ref(false)
const editVisible = ref(false)
<!-- 两个 el-dialog，或一个 dialog 里 if (mode) ... -->
```

**vue-layerx：**

```ts
const userLayer = useDetailLayer(UserForm)

userLayer.open({ props: { mode: 'view', ...row } })   // 详情
userLayer.open({ props: { mode: 'edit', ...row } })   // 编辑
```

```vue
<!-- OrderDetail.vue — 同一组件 -->
<UserForm mode="view" v-bind="user" />
```

## 教程路线

§1 详情弹层 → §2 OrderDetail 嵌入 → §3 编辑/新建 → §4 visible-outside → §5 adapt → §6 beforeClose

[搭建 BaseDialog](/guide/getting-started) → [§1](/guide/detail)
