# SSR 与限制

## SSR

可以在 Nuxt、Vite SSR 等项目里正常安装和 import。弹层本身是**客户端 UI**：

- 服务端没有 DOM 时，不会去挂弹层  
- `open()` 请放在 `onMounted` 之后，或用户点击等交互里  
- 模块单例的 `bindHost()` 也在客户端 setup 里做  
- 服务端 HTML **不会**带上弹层内容  

## 使用上的限制

- 模块顶层单例要在 App / ConfigProvider 子树里 `bindHost()`（见 [实例的更多能力](/guide/instance#模块顶层的单例bindhost)）  
- `open({ ... })` 只接受普通对象；要跟着数据变的默认值，写在 `createLayer` / `defineLayer` / `useDialog` 等处（见 [响应式配置](/guide/reactive-config)）  
- `LayerTemplate` 的 `name` 必须和目标插槽一致；对不上就不会显示（和普通 Vue 插槽一样）  

## 相关

- [容器与内容未拆分](/guide/no-container)
