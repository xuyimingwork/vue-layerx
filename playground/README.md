# vue-layerx Playground

Element Plus 示例，按 **Lv.1 → Lv.8** 由易到难演示框架能力。

## 目录结构

```
src/
  app/App.vue              # 入口
  core/layers.ts           # createLayer 工厂（useDialog / useDrawer / useAlertDialog）
  ui/                      # 布局壳（PlaygroundShell、DemoSection）
  demos/
    catalog.ts             # 演示注册表（顺序、分组、元数据）
    types.ts
    01-basic/              # Lv.1 打开与关闭
    02-crud/               # Lv.2 列表 CRUD
    03-inline-reuse/       # Lv.3 页内复用
    04-dual-layer/         # Lv.4 Dialog / Drawer 双容器
    05-clone/              # Lv.5 clone 多实例
    06-before-close/       # Lv.6 未保存拦截
    07-config-merge/       # Lv.7 配置合并
    08-lifecycle/          # Lv.8 工厂默认与卸载清理
```

每个 demo 目录：

- `index.vue` — 使用侧（调用 show / 业务 UI / LayerBind）
- `*Content.vue` — 定义侧（defineLayer、LayerTemplate name）

## 运行

```bash
pnpm playground
```
