# 实例的更多能力

[打开与关闭](/guide/open-close) 里已经用过 `open` / `close` / `visible`（`visible` 为只读 getter，直接读 `dialog.visible`）。这里补充克隆实例、拿组件引用，以及模块单例要注意的一点。

要从弹层拿回数据，见 [等待弹层结果](/guide/confirm)。

## 克隆一份独立实例

```ts
const main = useDialog(UserForm, { props: { mode: 'view' } })
const editor = main.clone({ props: { mode: 'edit' } })
```

`editor` 与 `main` 互不影响；会带上原来的默认配置，但可以再覆盖。

## 拿到内容 / 容器组件实例

打开后可通过只读的 `content`、`container` 访问组件实例；关闭后为 `null`。需要命令式调子组件方法时用它们即可。

## 卸掉挂载点：unmount

`close()` 只是关掉显示；`unmount()` 会卸掉弹层挂到页面上的 DOM。一般业务用 `close` 就够。

## 模块顶层的单例：bindHost

在组件 `setup` 里写的 `useDialog(...)` 一般不用操心。

若把实例建在**模块顶层**（例如全局 MessageBox）：

```ts
// layers/message-box.ts
export const messageBox = useDialog(MessageContent)
```

需要在 App（或 `ElConfigProvider`）**里面**的某个 `setup` 中调用一次：

```ts
messageBox.bindHost()
```

否则内容组件可能拿不到全局的 provide（主题、语言等）。

## 下一步

[用 adapter 统一改配置](/guide/adapter)
