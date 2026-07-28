<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/confirm/App.vue'
import AppSource from '../examples/confirm/App.vue?raw'
import PickerSource from '../examples/confirm/MemberPicker.vue?raw'
</script>

# 等待弹层结果

需要从弹层**拿回数据再继续**时（成员多选、复杂表单提交结果等），用 `confirm()`：打开并 `await`，确认路径 resolve，取消 / 关闭则 reject。

这不是 `ElMessageBox.confirm` 那种一句话确认框——内容仍是普通业务组件，只是调用方换成「等结果」而不是只 `open`。

日常「点确定就关、不必拿返回值」用 [用事件关闭弹层](/guide/close-on) 即可，不必碰 `confirm` / `confirmed`。

## 调用方：await confirm()

```ts
try {
  const { data } = await picker.confirm({ props: { modelValue: ids } })
  // 使用 data …
} catch {
  // 取消、点遮罩关闭等：按业务处理即可
}
```

参数形态与 `open` 相同（当次 plain 快照）。

> 通过 `confirm()` 打开后，在 `resolve` 前不能再 `open` / `confirm`：再 `open` 会被忽略并告警，再 `confirm` 会 reject `busy`。

## 内容侧：标出确认路径

`confirm()` 能 resolve，是因为关层时命中了某个带 `confirmed: true` 的关闭事件。`closeOn` 默认 `confirmed: false`，所以要用 `confirm()` 拿结果，须把「确定」标成确认路径：

```ts
defineLayer({
  content: {
    closeOn: {
      confirm: { when: 'always', confirmed: true },
      cancel: { when: 'always', confirmed: false },
    },
  },
})
```

- `confirmed: true`：关层时 `confirm()` **resolve**，`data` 为该事件的第一个参数  
- `confirmed: false`（或数组糖）：关层时 **reject**  

> 若从未配置过 `confirmed: true`，则除手动 `close({ confirmed: true })` 外，其它关闭都会走向 reject。

## 手动 close 触发 resolve

正在 `confirm()` 等待时，调用方也可以主动 `close` 来 resolve / reject，不必经过内容 `emit`：

```ts
const pending = picker.confirm({ props: { modelValue: ids } })

picker.close({ confirmed: true, args: [selected] })
// → pending resolve，data === selected

picker.close() // 或不传 confirmed: true → reject
```

## resolve / reject 携带的数据

resolve 得到 `LayerConfirmResult`：

| 字段 | 说明 |
|------|------|
| `data` | 等于 `args[0]`；无参数时为 `undefined` |
| `args` | 关闭时带上的参数列表（事件参数，或 `close({ args })`） |
| `event` | 事件驱动关闭时的事件名；手动 `close` / `unmount` 无此字段 |
| `source` | `content` \| `container` \| `instance` \| `unmount` |

reject 时是 `LayerConfirmError`：`code: 'close'` 时 `e.result` 与上表同形；`code: 'busy'` 时没有 `result`。

## 报错处理

非确认路径关闭时（取消、点遮罩、普通 `close()` 等），`confirm()` 会 reject `LayerConfirmError`，`code` 为 `'close'`：

```ts
import { LayerConfirmError } from 'vue-layerx'

try {
  const { data } = await picker.confirm({ props: { modelValue: ids } })
} catch (e) {
  if (e instanceof LayerConfirmError) {
    // e.code === 'close'：按业务处理即可
  }
}
```

一种特殊情况：弹层已打开，或正在 `confirm` 时再调 `confirm()`，会 reject `code: 'busy'`（可用来提示「选择器已打开」等）。

## Demo

同一 `MemberPicker`：页内勾选即时更新；弹层里勾选后 `await confirm()` 拿回选中成员。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'MemberPicker.vue', code: PickerSource },
  ]"
/>

## 下一步

运行时再定内容见 [动态指定内容组件](/guide/dynamic-content)。`clone`、`unmount`、模块单例等见 [实例的更多能力](/guide/instance)。错误码与成员表见 [API：LayerInstance](/api/layer-instance)。
