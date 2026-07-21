# 实例进阶

`useLayer(Content)`（即 `createLayer` 返回的工厂）得到 `LayerInstance`。基础用法见 [打开与关闭](/guide/open-close)；本节补齐进阶成员。

## clone

派生**独立**实例，继承工厂与父级 `use` tier（不继承父 `use` 的 `props.ref`）：

```ts
const main = useDialog(UserForm, { props: { mode: 'view' } })
const editor = main.clone({ props: { mode: 'edit' } })
```

`clone` 的配置可为 live（`MaybeRefOrGetter`）。

## contentRef / containerRef

只读 computed：打开时分别指向内容 / 容器组件实例，关闭后为 `null`。命令式访问子实例时优先用它们，而不是在配置里玩 `props.ref` 字符串。

## unmount

卸掉 portal DOM 挂载点。与 `close()`（只关可见性）不同。confirming 中 `unmount` 会按约定 settle/reject，详见 API。

## confirm

需要「打开 → 等用户确认再拿到结果」时：

```ts
try {
  const result = await dialog.confirm({ props: { id: 1 } })
  // closeOn.confirmed: true 或 close({ confirmed: true })
} catch (e) {
  if (e instanceof LayerConfirmError) {
    // code: 'close' | 'busy'
  }
}
```

与 `closeOn` 的 `confirmed` 字段配合。完整表见 [API：LayerInstance](/api/layer-instance)。

## bindHost 与模块单例

在 `setup` 里调用的 `useLayer` / `clone` 会自动尝试 `bindHost()`，以便内容能 `inject` 到 App / ConfigProvider。

**模块级单例**（例如 `export const messageBox = useDialog(...)` 写在模块顶层）必须在 App 或 `ElConfigProvider` **子树内**的 setup 中手动：

```ts
messageBox.bindHost()
```

否则 content 拿不到全局 provide。同一 host 重复调用为 no-op。

## 下一步

[SSR 与限制](/guide/ssr)
