# 配置如何合并

标题、宽度、`closeOn`、插槽模板等，可能写在好几个地方。框架按固定顺序合并：**越靠后写的、越靠近「这一次打开」的，优先级越高**。

## 先记这一条

```text
open（当次打开）
  > useDialog 第二参（创建实例时）
  > defineLayer（内容组件里）
  > createLayer（组合式函数上）
```

同名字段：上面的覆盖下面的。

例如：`createLayer` 默认宽度 `480px`，某次 `open({ container: { props: { width: '640px' } } })` 就会用 `640px`。

## 插槽模板也一样

`LayerTemplate` 填进的插槽，也会参与合并。实用规则：

- 页面上带 `container` 的模板，可以盖过内容组件里写的同名容器插槽  
- 同一处重复注册同名模板时，后注册的生效（开发环境会提示）  

更细的层级表见 [API：配置](/api/config)。

## 合并前先分清 props 给谁

「顶层 `props` 到底是容器还是内容」搞混，会出现「标题没生效」这类问题。回顾：[打开与关闭 · 顶层 props](/guide/open-close#顶层-props-指哪一侧)。

## closeOn 的合并方式

多处都写了 `closeOn` 时，按**事件名**合并（可以只改某一个事件），不是整份列表互相替换。细节见 API。

## 下一步

[响应式配置](/guide/reactive-config) · [用 adapter 统一改配置](/guide/adapter)
