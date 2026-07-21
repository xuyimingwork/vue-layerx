# 响应式配置

`createLayer`、`defineLayer`、`useLayer`、`clone` 的配置支持 `MaybeRefOrGetter`：传入 plain 对象、`ref`、`computed` 或 getter 均可。

## 哪些是 live

```ts
// 工厂：i18n 标题随语言变
createLayer(ElDialog, () => ({
  props: { title: t('user.edit') },
}))

// define：倒计时标题（不 remount content）
defineLayer(() => ({
  props: { title: `请确认（${left.value}s）` },
}))

// use：随列表当前行变化
const id = ref('1')
const dialog = useDialog(UserForm, () => ({
  props: { recordId: id.value },
}))
```

live 源在弹层**已打开**时仍可驱动合并结果更新（例如 title）。

## open 是快照

`open(config?)` 的参数**只能是 plain 对象**，表示当次打开的快照，不是 getter。

```ts
dialog.open({ props: { id: row.id } }) // OK
// dialog.open(() => ({ props: { id: id.value } })) // 不要这样
```

空 `open()` 使用当前 live 的 use / 更低 tier，不再额外叠一层 open 快照。

## 与 remount 的关系

- `close()` 后再 `open()`：内容子树重建，`defineLayer` / 内容侧 `LayerTemplate` 会再跑一遍 setup  
- 已打开时再次 `open(config)`：更新 open tier，**不**默认 remount 内容  

设计细节见仓库 [ADR 0003](https://github.com/xuyimingwork/vue-layerx/blob/main/docs/adr/0003-reactive-layer-config.md)。

## 下一步

[adapter](/guide/adapter)
