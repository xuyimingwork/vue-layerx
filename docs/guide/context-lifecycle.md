<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../examples/context-lifecycle/App.vue'
import AppSource from '../examples/context-lifecycle/App.vue?raw'
import HostPanelSource from '../examples/context-lifecycle/HostPanel.vue?raw'
import ContentSource from '../examples/context-lifecycle/ScopeContent.vue?raw'
import ModuleSource from '../examples/context-lifecycle/module-dialog.ts?raw'
</script>

# 上下文与生命周期

## 什么是上下文

命令式打开时，内容是**运行时动态挂上的**，并不在你当初写的那棵模板组件树里。祖先上的 `provide`、`ElConfigProvider`（主题、语言、尺寸）等，默认到不了内容——`inject` / `useGlobalConfig` 会对不齐。这是相对「模板里直接写 `<ElDialog>`」多出来的一课。

## 什么是生命周期

这里的「生命周期」指：弹层**何时从 DOM 和内存里彻底卸掉**。

`close()` 往往只是关掉显示，节点和实例可能还在。若打开用过之后从不完整卸载，层会一直占着 DOM 与内存，越开越多，形成泄漏。

因此需要明确的完整卸载时机（例如 `unmount()`，或后面说的 Host 卸载连带清理）。

## 为何要有 Host

上下文（内容能不能 inject）和生命周期（层何时完整卸载）本来是**两件独立的事**。

vue-layerx 把它们放在一起考虑：

- 多数时候「谁在用这个弹层」，卸载后弹层也不该再留着——例如路径 A 上打开的层，切到路径 B 时，通常希望它一起消失并卸载，而不是浮在新页面上（若页面被 `keep-alive` 缓存，见 [与 keep-alive / 路由缓存](#与-keep-alive--路由缓存)）。
- 同时，弹层通常也要继承「谁在用它」的那份上下文（`provide`、ConfigProvider 等）。

这和传统把 `<ElDialog>` 写在页面模板里的行为一致：弹窗跟着页面走，也吃得到页面的注入。

因此引入了 **Host**（`LayerHost`）：承载这份弹层**上下文与生命周期**的组件。实例在创建时会自动绑到当前 `setup` 里的组件上（`useDialog` / `clone` 都是如此）。

- **上下文**：内容继承 Host 的 provide / appContext  
- **生命周期**：Host 卸载时，完整卸掉该实例的弹层  

多数时候 Host 与「真正点开弹层的组件」是同一个——页面里 `useDialog` 再 `open`，上下文和卸载都跟这页走：

```ts
// 页面 / 布局组件 setup 内
const dialog = useDialog(UserForm)
dialog.open() // 跟本页同上下文；本页（或路由页）卸了，弹层也卸
```

也会不一致，例如：

- 列表行很短命，却希望弹层跟列表页 / 布局走  
- 全局 MessageBox 应对齐 App 或 `ElConfigProvider` 壳，而不是某个深层按钮组件  

这时不要在短命组件上当 Host，下面按场景说明怎么挂。

## Host 与「弹层使用方」不一致时

原则只有一句：**Host 必须落在上下文 / 生命周期该归属的组件上**；点开按钮的组件可以只负责 `open`。常见有两种挂法，按你的实例放哪来选——没有孰优孰劣。

### 场景：多处打开，Host 跟布局 / 列表页

归属组件里 `useDialog`（自动 bindHost），再 `provide` / 导出；深层按钮只 `open`：

```ts
// Layout.vue（包在 ElConfigProvider 内）
const dialog = useDialog(UserForm)
provide('userDialog', dialog)

// 深层按钮
const dialog = inject('userDialog')!
dialog.open({ props: { id } })
```

适合：短命列表行、深层按钮——不希望行卸了弹层也没了，或希望跟页级 provide 走。

### 场景：模块顶层单例

实例在模块里创建，到处 `import` 同一份；在归属壳（App / 带 ConfigProvider 的布局）的 **setup 同步阶段** `bindHost()`：

```ts
// layers/message-box.ts
export const messageBox = useDialog(MessageContent)
```

```ts
// App.vue 或布局
messageBox.bindHost()
```

注意：须在 **setup 内同步**调用。不允许重复绑定，也不允许在 Host 仍存活时换绑到另一个组件（再调会忽略并告警）。`ElConfigProvider` 须是 bindHost 所在组件的祖先。

适合：全局 MessageBox、跨路由复用的同一 instance。

## Demo

改 size / 业务 provide 后打开：弹层里应看到 inject 标签、`useGlobalConfig('size')`，以及继承 size 的按钮实测宽×高。注意 `ElConfigProvider` 包在 Host 外（`App.vue`），`useDialog` / `bindHost` 在内层（`HostPanel.vue`）。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'HostPanel.vue', code: HostPanelSource },
    { name: 'ScopeContent.vue', code: ContentSource },
    { name: 'module-dialog.ts', code: ModuleSource },
  ]"
/>

## 关层、卸 DOM、卸 Host

| 动作 | 效果 |
|------|------|
| `close()` | 关掉显示，portal DOM 通常还在 |
| `unmount()` | 卸掉该实例的 portal DOM；**不**清 Host 绑定 |
| Host `onUnmounted` | 清 Host，并 `unmount` 弹层 |

日常业务用 `close` 即可。模块单例若绑在短命页面上，页面一卸绑定就掉；需要跨路由复用时，把 Host 放在长期存活的 App / 布局壳上，或换页后在新壳的 setup 里再 `bindHost()`。

### 与 keep-alive / 路由缓存

库只在 Host **真正卸载**（`onUnmounted`）时清绑定并卸层；**不**在 `keep-alive` 的 deactivate 时自动 `close` 或做其它处理。

这和模板里 `append-to-body` 的 `<ElDialog>` 一样：页被缓存藏起时，开着的层可能仍浮在 `body` 上。需要时把 Host 放在 `keep-alive` 之外的布局壳上，或在页内 `onDeactivated` 里自行 `close()`。

## 下一步

`clone`、`content` / `container` 引用见 [实例的更多能力](/guide/instance)。API 表见 [LayerInstance](/api/layer-instance)。
