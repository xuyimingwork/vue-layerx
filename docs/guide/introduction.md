# 为什么需要 vue-layerx

## 三种场景，一套内容组件

| 场景 | 传统写法 | vue-layerx |
|------|----------|------------|
| 列表点行看详情 | 列表页写 `el-dialog` + `v-model` + 详情 template | `useDetailLayer(UserDetail).show({ props: row })` |
| 订单页展示同一详情 | 再写一份详情 template，或 props 区分「弹层/页内」 | `<UserDetail v-bind="user" />` |
| 窄屏详情改 Drawer | 复制 Drawer 版 + 维护两套 | `useDetailLayer` 的 `adapt` 换壳 |

**Confirm 弹窗用 `MessageBox` 就够了。** vue-layerx 面向有实体的**详情 / 表单**，且要能**随处组合**。

## 传统 vs vue-layerx（列表详情）

**传统：**

```vue
<!-- UserList.vue -->
<script setup>
const visible = ref(false)
const current = ref(null)
</script>

<template>
  <el-table @row-click="current = row; visible = true" />
  <el-dialog v-model="visible" title="用户详情">
    <el-descriptions>...</el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
```

**vue-layerx：**

```vue
<!-- UserList.vue -->
<script setup>
const detail = useDetailLayer(UserDetail)
</script>

<template>
  <el-table>
    <el-button @click="detail.show({ props: row })">{{ row.name }}</el-button>
  </el-table>
</template>
```

```vue
<!-- UserDetail.vue — 弹层配置写在这里，不是 UserDetailDialog -->
<script setup>
defineLayer({ props: { title: '用户详情' } })
</script>
<template><el-descriptions>...</el-descriptions></template>
```

弹层 template 从列表页消失；详情组件在 `OrderDetail` 里也能直接用。

## 两个内容组件，不要混

| 组件 | 职责 | 工厂 |
|------|------|------|
| **UserDetail** | 纯展示 | `useDetailLayer`（含 adapt 响应式） |
| **UserForm** | 新建/编辑 | `useEditLayer` |

详情进 OrderDetail **只展示**；编辑才走 `UserForm` + 弹层。名字不带 Dialog，组合性才自然。

## 教程路线

```
§1 列表详情弹层 → §2 OrderDetail 组合 → §3 编辑表单
→ §4 visible-outside（页内也要保存按钮）
→ §5 useDetailLayer + adapt（Dialog/Drawer 切换）
→ §6 beforeClose
```

[搭建 BaseDialog](/guide/getting-started) → [§1 列表详情](/guide/detail)
