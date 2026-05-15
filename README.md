# vue-layerx

Vue 3 弹层工厂：一次定义 Shell（如 `ElDialog`），在组件内得到可命令式 `.show()`、也可在模板里传参/插槽透传的 Layer 组件。

## 设计目标（README 原始想法）

```ts
// 模块级：绑定外壳组件
const useDialog = createLayers(ElDialog, { props: { width: '520px' } })

// setup 内：绑定内层表单 + 默认行为
const CreateDialog = useDialog(CreateForm, {
  props: { mode: 'create' },
  closeOn: ['success', 'cancel'],
  shellProps: { title: '新建' },
})

CreateDialog.show({ id: 1 }) // 命令式打开，动态参数

// 模板：声明式传参 + 插槽透传到 CreateForm
<CreateDialog :record="row" @success="refresh">
  <template #footer>自定义底部</template>
</CreateDialog>
```

## 架构

```
createLayers(Shell, shellDefaults)
        │
        ▼
    useLayer(Inner, instanceDefaults)  ──►  LayerComponent
        │                                      ├─ .show(payload?)
        │                                      ├─ .hide()
        │                                      └─ <Layer> 模板用法
        │
        ▼
  reactive state { visible, imperativeProps }
        │
        ▼
  render: Shell(visible) → default → Inner(merged props + slots)
```

| 能力 | 实现要点 |
|------|----------|
| 命令式 `show/hide` | `useLayer` 闭包内的 `reactive` 状态，挂到返回组件的静态方法 |
| 模板传参 | `ctx.attrs` 与 `show()` 的 payload、`instanceDefaults.props` 合并后传给 Inner |
| 插槽透传 | `<CreateDialog>` 的 slots 作为 Inner 的 slots |
| 自动关闭 | `closeOn: ['event']` 包装 Inner 的 `onEvent`，触发后 `hide()` |
| Shell 显隐 | 默认 `modelValue` / `update:modelValue`，可通过 `visibleProp` / `visibleEvent` 定制 |

## 开发

```bash
pnpm install
pnpm test
pnpm build
pnpm playground   # 启动 Element Plus 示例
```

Playground 位于 `playground/`（Vite + Vue 3 + TS），通过 alias 直接引用 `src/` 便于联调。

## API（当前）

### `createLayers(Shell, options?)`

- `options.props` — Shell 默认 props
- `options.visibleProp` / `options.visibleEvent` — 非 Element Plus 时可改显隐协议

### `useLayer(Inner, options?)` → `LayerComponent`

- `options.props` — Inner 默认 props
- `options.closeOn` — Inner 触发即关闭的事件名列表
- `options.shellProps` — 仅该 Layer 实例的 Shell props

`LayerComponent` 同时具备 Vue 组件与 `show` / `hide` / `visible`。

## 后续可扩展

- [ ] `show()` 返回 `Promise`，配合 `closeOn` 做 `await CreateDialog.show()`
- [ ] 多实例栈（嵌套弹窗 z-index）
- [ ] `teleport` / 挂载到 `body` 的选项
- [ ] 与 Element Plus `ElDialog` 的示例包（`examples/`）
