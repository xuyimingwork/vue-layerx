# vue-layerx Demos · Vue 3

Element Plus 示例，按 **Lv.1 → Lv.8** 由易到难演示框架能力。

## 目录结构

```
src/
  app/App.vue              # 入口
  core/layers.ts           # createLayer 工厂（useDialog / useDrawer / useAlertDialog）
  ui/                      # 布局壳（DemoShell、DemoSection）
  demos/
    catalog.ts             # 演示注册表（顺序、分组、元数据）
    types.ts
    01-basic/ …
```

每个 demo 目录：

- `index.vue` — 使用侧（调用 open / close / 业务 UI / LayerTemplate :to）
- `*Content.vue` — 定义侧（`defineLayer`、`LayerTemplate :to="layer"`）

## 运行

```bash
pnpm demos          # 或 pnpm demos:vue3 → http://localhost:5173
```

站点部署路径：`/demos/vue3/`（见根目录 `pnpm site:build`）。Vue 2 示例见 `demos-vue2/`。
