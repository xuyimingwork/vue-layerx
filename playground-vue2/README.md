# vue-layerx · Vue 2.7 Playground

Element UI 示例，验证 Vue 2.7 适配（尤其 `model: 'visible'`）。

## 运行

```bash
# 仓库根目录
pnpm playground:vue2
```

本地默认 [http://localhost:5174](http://localhost:5174)。

## Demo

| 示例 | 关注点 |
|------|--------|
| 三行打开 | `createLayer(Dialog, { model: 'visible' })` |
| 列表 CRUD | `open({ props })` + 双向 `LayerTemplate` |
| confirm() | Promise 确认框 |

完整 Vue 3 + Element Plus 示例见根目录 `playground/`。
