# Architecture Decision Records

本目录记录 vue-layerx 的重要设计决策。每篇 ADR 自洽，包含背景、备选方案、取舍与结论（或待定项）。

| ADR | 标题 | 状态 |
|-----|------|------|
| [0001](./0001-legacy-monolith-progressive-adoption.md) | 存量单体弹窗（UserDialog）渐进式接入 | Accepted（`LayerNoContainer`） |
| [0002](./0002-open-use-override-container-component.md) | `useX` / `open` 覆盖 `container.component` | Accepted（允许，无 warn） |
| [0003](./0003-reactive-layer-config.md) | Layer 配置响应式（MaybeRefOrGetter + store computed） | Accepted |
| [0004](./0004-merge-unknown-fields.md) | `mergeFragment` / 节点是否保留未知字段 | Accepted（白名单；扩展待定） |
| [0005](./0005-content-self-contained-close-on.md) | `defineLayer` 不暴露 `close`：关层经 content emit + `closeOn` | Accepted |
| [0006](./0006-instance-state-as-getters.md) | `LayerInstance` 状态用只读 getter：`visible` / `content` / `container` | Accepted |
| [0007](./0007-static-define-via-define-options.md) | 内容侧静态 define：`defineOptions` 优先于自研宏 / setup 内换 `LayerNoContainer` | Deferred（搁置） |
