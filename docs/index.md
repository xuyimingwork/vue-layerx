---
layout: home

hero:
  name: vue-layerx
  text: 一个 UserForm，一个 useDetailLayer
  tagline: view 时 disabled，edit 时弹层保存——详情 / 编辑 / 新建同一套
  actions:
    - theme: brand
      text: 开始教程
      link: /guide/introduction
    - theme: alt
      text: §1 列表详情
      link: /guide/detail

features:
  - icon: 📋
    title: 不拆 UserDetail
    details: mode='view' 时表单 disabled；OrderDetail 与列表弹层同一组件。
  - icon: 🏭
    title: 不拆 useEditLayer
    details: useDetailLayer 覆盖详情、编辑、新建；adapt 窄屏换 Drawer。
  - icon: ✂️
    title: 比双 dialog 更短
    details: 列表页一行 open({ mode })，无 v-model、无第二个工厂。
---
