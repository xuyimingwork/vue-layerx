# LayerInstance

`useLayer` / `clone` 的返回值。

## 成员

| 成员 | 说明 |
|------|------|
| `open(config?)` | 打开；`config` 为 plain 快照。关闭后再打开会重建 content；已打开时再次 open 更新配置。confirming 中忽略并 warn |
| `$open(props?)` | 内容 props 糖：`$open(props)` ≡ `open({ props })`；无参 ≡ `open()`。不接受 `container` / `slots` 等（用 `open`） |
| `confirm(config?)` | 打开并返回 `Promise<LayerConfirmResult>`。`closeOn.confirmed: true` 或 `close({ confirmed: true })` 时 resolve，否则 reject [`LayerConfirmError`](#layerconfirmerror)（`code: 'close'`）。已打开 / confirming 再调 → `code: 'busy'` |
| `$confirm(props?)` | 内容 props 糖：`$confirm(props)` ≡ `confirm({ props })`；无参 ≡ `confirm()`。不接受完整 config（用 `confirm`） |
| `close(options?)` | 关闭（不卸 DOM）。confirming 时可传 `{ confirmed?, args? }` |
| `unmount()` | 卸 portal DOM；confirming 时 reject `source: 'unmount'`；**不**清 layerHost |
| `clone(config?)` | 独立实例；继承组合式函数默认与创建时配置（**不继承**父级 `props.ref`）；setup 内自动 `bindHost()`；`config` 可为响应式源 |
| `visible` | 只读 getter（`boolean`）；模板 / 脚本直接 `dialog.visible`，观测用 `watch(() => dialog.visible)` |
| `content` | 只读 getter；打开时指向 content 实例，否则 `null`。用法见 [指南：实例的更多能力](/guide/instance#拿到内容-容器组件实例) |
| `container` | 只读 getter；打开时指向 container 实例，否则 `null`。同上 |
| `bindHost()` | 绑定本 instance 当前 setup Host 的 provide / appContext；同一 host 再调 no-op |

## LayerConfirmError

```ts
import { LayerConfirmError } from 'vue-layerx'

try {
  await dialog.$confirm({ id: 1 })
} catch (e) {
  if (e instanceof LayerConfirmError) {
    // e.code: 'close' | 'busy'
  }
}
```

## 模块单例

```ts
// layers/message-box.ts
export const messageBox = useDialog(MessageContent)
```

须在 App 或 ConfigProvider **子树内** setup 调用 `messageBox.bindHost()`，否则 content 无法 inject。见 [指南：上下文与生命周期](/guide/context-lifecycle)。

## props.ref

各处的 `props.ref` 合并时链式执行。命令式拿组件实例优先用成员 `content` / `container`（见 [指南](/guide/instance#拿到内容-容器组件实例)）。`clone()` 不传 `props.ref` 时不会继承父实例创建时配置里的用户 ref。
