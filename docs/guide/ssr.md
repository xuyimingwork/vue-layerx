# SSR 与限制

## SSR

vue-layerx 可在 Nuxt、Vite SSR 等应用中**安全 import 与初始化**。弹层是客户端 UI：

- 无 DOM 时不会挂 portal  
- 模块单例请在**客户端** setup 内 `bindHost()`  
- `open()` 放在 `onMounted` 或用户交互之后  
- 服务端**不会**输出弹层 HTML  

## 限制

- 模块级单例须在 App / ConfigProvider 子树内 `bindHost()`，否则 content 无法 `inject` 全局配置  
- `open(config)` 仅为 plain 快照；live 配置请放在 create / define / use / clone  
- `LayerTemplate` 的 `name` 与目标 slot 对齐由使用者保证（与 Vue slot 一样，对不上则静默不展示）  

## 相关

- [实例进阶 · bindHost](/guide/instance#bindhost-与模块单例)  
- [渐进接入 LayerNoContainer](/guide/no-container)
