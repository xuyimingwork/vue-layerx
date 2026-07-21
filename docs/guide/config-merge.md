# 配置合并

配置可以出现在 `createLayer`、`defineLayer`、`useLayer`、`open`，以及多处 `LayerTemplate`。合并有固定优先级。

## 常用优先级

```text
open > useLayer > defineLayer > createLayer
```

后者被前者覆盖（同名字段）。

## LayerTemplate

模板也参与 slot 合并，大致为：

```text
open > use > use:template > define > define:template > create
```

口诀：

- 调用方 `:to="instance"`（内容槽）高于内容里的普通配置习惯上走 use 侧模板 tier  
- 调用方 `:to container` 高于内容内 `:to="layer"` 的同名容器槽  

同 tier 内同名 `LayerTemplate` 重复注册时，后者覆盖前者（开发环境会 warn）。

## 顶层 props 提醒

合并之前先分清「这一层的顶层 `props` 是容器还是内容」——见 [打开与关闭](/guide/open-close#顶层-props-指哪一侧)。写错侧会导致「标题没生效 / 内容 props 进了 Dialog」。

## closeOn

`closeOn` 按**事件名 patch**，不是整表替换。上层可以只改某一个事件的策略。详见 [API：配置](/api/config)。

## 下一步

[响应式配置](/guide/reactive-config) · [adapter](/guide/adapter)
