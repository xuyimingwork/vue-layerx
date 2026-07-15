# vue-layerx

Vue 3 命令式弹层工具库：`createLayer` 工厂 + `open()`，content 内 `defineLayer` / `LayerTemplate`，列表页远程投 slot。

> **`1.0.0-beta.1`** — 公开 API 已锁定（1.0 线）；beta → stable 以 soak / 文档 / 修 bug 为主。详见 [CHANGELOG](./CHANGELOG.md)。

## 安装

```bash
pnpm add vue-layerx@beta
# or
npm install vue-layerx@beta
```

稳定版发布后可改回 `pnpm add vue-layerx`。

Peer dependency: **Vue ^3.5.0**

## 快速开始

```ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'
import UserForm from './UserForm.vue'

const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})

const dialog = useDialog(UserForm, { closeOn: ['success'] })

dialog.open({
  props: { mode: 'edit', id: 1 },
  container: { props: { title: '编辑用户' } },
})

dialog.close()
```

## 核心 API

| 导出 | 说明 |
|------|------|
| `createLayer(Container, config?)` | 工厂；返回 `useLayer(Content?, useConfig?)` → `LayerInstance` |
| `defineLayer(config?)` | content 内声明 container 默认 props / closeOn |
| `LayerTemplate` | `:to` 必填；creator 传 `defineLayer()`，caller 传 `LayerInstance` |
| `LayerInstance` | `open` / `close` / `clone` / `visible` / `contentRef` / `containerRef` / `bindHost` |

## 文档

- 本地：`pnpm docs:dev`（[docs/](./docs/)）
- API 摘要：[docs/api/index.md](./docs/api/index.md)
- 设计说明：[DESIGN.md](./DESIGN.md)

## SSR

可用于 SSR 应用（Nuxt、Vite SSR 等）。弹层为客户端 UI：模块单例请在客户端 setup 内调用 `bindHost()`，`open()` 可在 `onMounted` 或用户交互后调用；服务端不会输出弹层 HTML。

## 限制

- 模块级单例须在 App / ConfigProvider 子树内调用 `bindHost()`，否则 content 无法 `inject` 全局配置

## 从 0.x 迁移

- **0.0.1** 为占名占位；请升级并参照 [CHANGELOG 0.1.0](./CHANGELOG.md#010---2026-06-27)（`show/hide` → `open/close`，移除 `LayerBind` 等）。
- **0.1.0 → 1.0 beta**：类型重命名等见 [CHANGELOG 1.0.0-beta.1](./CHANGELOG.md#100-beta1---2026-07-15)。

## License

MIT
