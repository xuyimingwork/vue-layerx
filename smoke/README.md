# smoke — 用 npm 已发布版本做验证

# smoke — 用 npm 已发布版本做验证

独立小项目，**不在** pnpm workspace 内（避免链到本地 `vue-layerx`），依赖 registry 上的包，用来模拟真实消费者。

## 用法

```bash
cd smoke
pnpm install --ignore-workspace
pnpm dev
```

`--ignore-workspace` 必须加，否则会走到仓库根 workspace。浏览器打开终端提示的地址（默认 `http://localhost:5180`）。

## 换版本

当前钉在 `1.0.0-beta.3`。验证更新版本时改 `package.json` 后重新安装：

```json
"vue-layerx": "1.0.0-beta.4"
```
