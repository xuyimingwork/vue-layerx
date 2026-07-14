# vue-layerx

Vue 3 命令式弹层工具库：`createLayer` 工厂 + `open()`，content 内 `defineLayer` / `LayerTemplate`，列表页远程投 slot。

> **Pre-1.0 (`0.1.0`)** — 首个可用版本。API 在 1.0 前仍可能调整；详见 [CHANGELOG](./CHANGELOG.md)。

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

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

## 从 0.0.1 迁移

npm 上的 `0.0.1` 为占名占位版。若曾安装过，请升级到 **0.1.0** 并参照 [CHANGELOG](./CHANGELOG.md#010---2026-06-27)（`show/hide` → `open/close`，移除 `LayerBind`，`adapter` 移入 `createLayer` 第二参数等）。

## License

MIT
