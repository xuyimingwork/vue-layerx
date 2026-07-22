# 响应式配置

有时默认标题要跟语言包走，或倒计时要反映在标题上。  
`createLayer`、`defineLayer`、`useDialog`（以及后面的 `clone`）的配置，除了传普通对象，还可以传 `ref`、`computed` 或返回配置的函数——配置会保持「活的」。

## 示例

```ts
// 组合式函数：标题跟 i18n 变
createLayer(ElDialog, () => ({
  props: { title: t('user.edit') },
}))

// 内容里：倒计时标题
defineLayer(() => ({
  props: { title: `请确认（${left.value}s）` },
}))

// 创建实例时：跟着当前行 id
const id = ref('1')
const dialog = useDialog(UserForm, () => ({
  props: { recordId: id.value },
}))
```

弹层已经打开时，这类配置仍可继续更新合并结果（例如标题数字在变）。

## open 的参数是「当次快照」

`open({ ... })` 只接受普通对象，表示**这一次**打开带上的值，不要传函数：

```ts
dialog.open({ props: { id: row.id } }) // 正确
```

不传参的 `open()`，会用上面那些「活的」默认配置，不再叠一层当次覆盖。

## 关掉再开 vs 开着再 open

- `close()` 后再 `open()`：内容会重新挂载，`defineLayer` 等会再执行一遍  
- 已经打开时再 `open({ props })`：主要更新当次配置，**默认不会**拆掉重建内容  

## 下一步

[实例的更多能力](/guide/instance)
