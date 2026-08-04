# 实例的更多能力

[打开与关闭](/guide/open-close) 里已经用过 `open` / `close` / `visible`。这里补充克隆、拿组件引用、`unmount`。

要从弹层拿回数据，见 [等待弹层结果](/guide/confirm)。provide / `bindHost` / 卸 Host，见 [上下文与生命周期](/guide/context-lifecycle)。成员表见 [API：LayerInstance](/api/layer-instance)。

## 克隆一份独立实例

```ts
const main = useDialog(UserForm, { props: { mode: 'view' } })
const editor = main.clone({ props: { mode: 'edit' } })
```

`editor` 与 `main` 互不影响；会带上原来的默认配置，但可以再覆盖。在 setup 里 `clone` 时，新实例会自动 `bindHost`。

## 拿到内容 / 容器组件实例

日常优先用 props 进、`emit` + `closeOn` 出。若必须命令式调子组件方法（如 `validate()`），打开后可通过只读的 `content`、`container` 访问组件实例；关闭后为 `null`。

```ts
dialog.$open({ id: 1 })
await nextTick()
dialog.content?.validate?.()
```

配置里写 `props.ref` 也能挂到组件上，但命令式场景更推荐上面的 `content` / `container`（合并与 `clone` 不继承等细节见 [API：LayerInstance](/api/layer-instance#propsref)）。

## 卸掉挂载点：unmount

`close()` 只是关掉显示；`unmount()` 会卸掉弹层挂到页面上的 DOM（不清 Host）。一般业务用 `close` 就够。和 Host 卸载的关系见 [上下文与生命周期](/guide/context-lifecycle#关层卸-dom卸-host)。

## 下一步

[用 adapter 统一改配置](/guide/adapter)
