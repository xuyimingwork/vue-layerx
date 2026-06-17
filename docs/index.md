---
layout: home

hero:
  name: vue-layerx
  text: 详情弹层，比传统写法更短
  tagline: UserDetail 随处组合 · useDetailLayer 响应式换壳 · 一个教程走完
  actions:
    - theme: brand
      text: 开始教程
      link: /guide/introduction
    - theme: alt
      text: §1 列表详情
      link: /guide/detail

features:
  - icon: 📋
    title: UserDetail，不是 UserDetailDialog
    details: 订单页只读展示、列表弹层详情——同一个组件，defineLayer 跟着内容走。
  - icon: 📱
    title: useDetailLayer + adapt
    details: 窄屏自动 Drawer，业务页始终 detailLayer.show(row) 一行。
  - icon: ✂️
    title: 比 el-dialog 模板更短
    details: createLayer(BaseDialog) 零配置；列表页不写 v-model 和 footer。
---
