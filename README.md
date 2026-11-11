<h1 align="center">vue-layerx</h1>

<p align="center">
  简体中文 | <a href="./README.en.md">English</a>
</p>

<p align="center">
  <b>弹窗编程新范式</b><br />
  像路由导航一样打开弹窗<br />
  像普通组件一样复用弹窗内容
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue-layerx"><img src="https://img.shields.io/npm/v/vue-layerx.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/vue-layerx"><img src="https://img.shields.io/npm/dm/vue-layerx.svg" alt="npm downloads" /></a>
  <a href="https://github.com/xuyimingwork/vue-layerx/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/xuyimingwork/vue-layerx/ci.yml?branch=main&label=ci" alt="ci" /></a>
  <a href="https://codecov.io/gh/xuyimingwork/vue-layerx"><img src="https://codecov.io/gh/xuyimingwork/vue-layerx/graph/badge.svg" alt="codecov" /></a>
  <br />
  <a href="https://bundlejs.com/?q=vue-layerx&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22vue%22%5D%7D%7D"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdeno.bundlejs.com%2F%3Fq%3Dvue-layerx%26config%3D%257B%2522esbuild%2522%253A%257B%2522external%2522%253A%255B%2522vue%2522%255D%257D%257D&query=%24.size.compressedSize&label=minzip" alt="minzip" /></a>
  <img src="https://img.shields.io/badge/vue-2.7%20%2F%203.3%2B-42b883.svg?logo=vue.js" alt="vue" />
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/vue-layerx.svg" alt="license" /></a>
</p>

<p align="center">
  📚 <a href="https://xuyimingwork.github.io/vue-layerx/">文档</a> ·
  🎮 <a href="https://element-plus.run/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cbmltcG9ydCB7IEVsQnV0dG9uIH0gZnJvbSAnZWxlbWVudC1wbHVzJ1xuaW1wb3J0IEhlbGxvV29ybGQgZnJvbSAnLi9IZWxsb1dvcmxkLnZ1ZSdcbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4vZGlhbG9nJ1xuXG5jb25zdCBkaWFsb2cgPSB1c2VEaWFsb2coSGVsbG9Xb3JsZClcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxFbEJ1dHRvbiBAY2xpY2s9XCJkaWFsb2cub3BlbigpXCI+5omT5byA5by556qXPC9FbEJ1dHRvbj5cbjwvdGVtcGxhdGU+XG4iLCJlbGVtZW50LXBsdXMuanMiOiJpbXBvcnQgRWxlbWVudFBsdXMgZnJvbSAnZWxlbWVudC1wbHVzJ1xuaW1wb3J0IHsgZ2V0Q3VycmVudEluc3RhbmNlIH0gZnJvbSAndnVlJ1xuXG5sZXQgaW5zdGFsbGVkID0gZmFsc2VcbmF3YWl0IGxvYWRTdHlsZSgpXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEVsZW1lbnRQbHVzKCkge1xuICBpZiAoaW5zdGFsbGVkKSByZXR1cm5cbiAgY29uc3QgaW5zdGFuY2UgPSBnZXRDdXJyZW50SW5zdGFuY2UoKVxuICBpbnN0YW5jZS5hcHBDb250ZXh0LmFwcC51c2UoRWxlbWVudFBsdXMpXG4gIGluc3RhbGxlZCA9IHRydWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHlsZSgpIHtcbiAgY29uc3Qgc3R5bGVzID0gWydodHRwczovL2Zhc3RseS5qc2RlbGl2ci5uZXQvbnBtL2VsZW1lbnQtcGx1c0BsYXRlc3QvZGlzdC9pbmRleC5jc3MnLCAnaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9lbGVtZW50LXBsdXNAbGF0ZXN0L3RoZW1lLWNoYWxrL2RhcmsvY3NzLXZhcnMuY3NzJ10ubWFwKChzdHlsZSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpXG4gICAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0J1xuICAgICAgbGluay5ocmVmID0gc3R5bGVcbiAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUpXG4gICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQobGluaylcbiAgICB9KVxuICB9KVxuICByZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKHN0eWxlcylcbn1cbiIsInRzY29uZmlnLmpzb24iOiJ7XG4gIFwiY29tcGlsZXJPcHRpb25zXCI6IHtcbiAgICBcInRhcmdldFwiOiBcIkVTTmV4dFwiLFxuICAgIFwianN4XCI6IFwicHJlc2VydmVcIixcbiAgICBcIm1vZHVsZVwiOiBcIkVTTmV4dFwiLFxuICAgIFwibW9kdWxlUmVzb2x1dGlvblwiOiBcIkJ1bmRsZXJcIixcbiAgICBcInR5cGVzXCI6IFtcImVsZW1lbnQtcGx1cy9nbG9iYWwuZC50c1wiXSxcbiAgICBcImFsbG93SW1wb3J0aW5nVHNFeHRlbnNpb25zXCI6IHRydWUsXG4gICAgXCJhbGxvd0pzXCI6IHRydWUsXG4gICAgXCJjaGVja0pzXCI6IHRydWVcbiAgfSxcbiAgXCJ2dWVDb21waWxlck9wdGlvbnNcIjoge1xuICAgIFwidGFyZ2V0XCI6IDMuM1xuICB9XG59XG4iLCJQbGF5Z3JvdW5kTWFpbi52dWUiOiI8c2NyaXB0IHNldHVwPlxuaW1wb3J0IEFwcCBmcm9tICcuL0FwcC52dWUnXG5pbXBvcnQgeyBzZXR1cEVsZW1lbnRQbHVzIH0gZnJvbSAnLi9lbGVtZW50LXBsdXMuanMnXG5zZXR1cEVsZW1lbnRQbHVzKClcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxBcHAgLz5cbjwvdGVtcGxhdGU+XG4iLCJpbXBvcnQtbWFwLmpzb24iOiJ7XG4gIFwiaW1wb3J0c1wiOiB7XG4gICAgXCJ2dWVcIjogXCJodHRwczovL2Zhc3RseS5qc2RlbGl2ci5uZXQvbnBtL0B2dWUvcnVudGltZS1kb21AbGF0ZXN0L2Rpc3QvcnVudGltZS1kb20uZXNtLWJyb3dzZXIuanNcIixcbiAgICBcIkB2dWUvc2hhcmVkXCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9AdnVlL3NoYXJlZEBsYXRlc3QvZGlzdC9zaGFyZWQuZXNtLWJ1bmRsZXIuanNcIixcbiAgICBcImVsZW1lbnQtcGx1c1wiOiBcImh0dHBzOi8vZmFzdGx5LmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQGxhdGVzdC9kaXN0L2luZGV4LmZ1bGwubWluLm1qc1wiLFxuICAgIFwiZWxlbWVudC1wbHVzL1wiOiBcImh0dHBzOi8vZmFzdGx5LmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQGxhdGVzdC9cIixcbiAgICBcIkBlbGVtZW50LXBsdXMvaWNvbnMtdnVlXCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9AZWxlbWVudC1wbHVzL2ljb25zLXZ1ZUAyL2Rpc3QvaW5kZXgubWluLmpzXCIsXG4gICAgXCJ2dWUtbGF5ZXJ4XCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS92dWUtbGF5ZXJ4QGxhdGVzdC9kaXN0L2luZGV4LmpzXCJcbiAgfSxcbiAgXCJzY29wZXNcIjoge31cbn0iLCJIZWxsb1dvcmxkLnZ1ZSI6Ijx0ZW1wbGF0ZT5cbiAg5L2g5aW95LiW55WMXG48L3RlbXBsYXRlPiIsImRpYWxvZy50cyI6ImltcG9ydCB7IGNyZWF0ZUxheWVyIH0gZnJvbSAndnVlLWxheWVyeCdcbmltcG9ydCB7IEVsRGlhbG9nIH0gZnJvbSAnZWxlbWVudC1wbHVzJ1xuXG5leHBvcnQgY29uc3QgdXNlRGlhbG9nID0gY3JlYXRlTGF5ZXIoRWxEaWFsb2csIHsgcHJvcHM6IHsgYXBwZW5kVG9Cb2R5OiB0cnVlIH0gfSkiLCJfbyI6e319">Element Plus</a> ·
  🎮 <a href="https://play.vuetifyjs.com/#eNqlVm1v2zYQ/iusOkAyYEsJkqJbYGdeuwztUKxFE2wfonyQpZPNhCI1knJsBP7vO77oxY6RBSgQIeTdw7vnjuRD3z4FWuWCl3QZ3yvBg4vgKeWEpEEuqpoykF9rTQVXaXBBrMf4MsbE45/WpmUD49aeryB/OGK/VxtjS4NvEhTINaRB59OZXIJ27qvrv2CD485ZiaJhiH7B+R2UYI3h6GAfGl4g7QHOsv1c1UJqypc36mqjgau2KEPUIHcWnwbrBj6+UHpP9yw+s+tSjn/BOKA2w6TK6oNOOsd+GMzi6K60rtVFkuQFx2UFMLqWMQed8LpK5ghLZMM1rWBSiGp+Fr+Lz0+Tgio9tMegqslCikdsLkYZ1G4C2I7LiQRegDSdeV3eg2V7uQ98L+bXtNy+IqdHzs/j0/hnl8WbJixbKJPiWWj0bEH6s/V/0T14zjINGNxmoMh/Y8PubSWj/EEd3gdld/C2Tf9DxdhgJtIdpsSESubJb3UdIwgzTjVUtaF5aSDT9SSrazu0k4XmZJ4zmj/M0qCgGRPL+CdRA49GaXD5FQfkd2udJhbsguDYRZkmg+g4VbmktSYKdOOSuONKPgFem3+EZAUppahIGCe9yRANB+An0ihwWcmuwztyiDNIFBmliTORWY+P+qgjw87xQSa+LVVGeawVtqXLlUtA+tivLpej0wF8rwdUvKUHmdWt03e+d6LN9sNSd8Sxeci6yxzhh3TRGnv1BCmF/JRZ8UEkkNmlrVkwcL4IcIFbgsVHnlFnqwTe5yh8i+MQjb56S8OVL6ESa7jWWwY32RI3m39D/lRBjAIX3TKRFX8IDDEaEzP+bJJHozuboGx4brSM7Ach0chJkqtRo2VGCpE3FXAd/9uA3F4Dg1wj+/Bte4L1ClB2lImhVgDa0MWTUJLoDUYYYQ7dSLvnOI3rDFVCXzFcgzFd/o8ryorIgO2NG/AzzC07G5lEKwml5+jCEg6PxBceRficCLaGMTrvkebINN1rrCvJ3ORhTW4DPZsoNG5Hn1go8mMIDwfFDZyGDHrNv4E1K4qrNUb7grccOGCnTBGh4WTJDcM/x9qjYcG2AIft6C5EsY3xRKDORiaA9e+Ods3sfbefvlf73YzCVrNKxKp4KcSSQVZT1CNRJahJv5ZZRdl29l0shBYXpycn4zP8zvF7h997/H45OTENe57fnrfXEjj+6lQFtdTm7+ONoYN3X4NElShA0SWnJkNcoRygz5Pw18QfzaM68feBGPRSkHLYWKg7K61qtNfcL4xsQfbQdw94AWXWMH3jjHiMlisd+pcpSdqfE2ajPMF96Xyu8QVdX1oMsaA3UxTP9aFa+1he84/V+sU8ccNK/aPXS9uHrBPqVv56k1fBg7700t52xqaJ+nV9nfuxjr1ljn3/nOWZLPwM54oJTZLWi49W5zaTbu1+W3bjwP04QRL2xQ3GZcYU7L+rrc1vczB+6oYXftnu7j8bCcr0">Vuetify</a>
</p>

<p align="center">
  <a href="https://zread.ai/xuyimingwork/vue-layerx"><img src="https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff" alt="zread" /></a>
  <a href="https://deepwiki.com/xuyimingwork/vue-layerx"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" /></a>
</p>

三行代码上手：

```ts
// 1. 用弹窗组件创建组合式函数
const useDialog = createLayer(ElDialog)   
// 2. 用普通组件创建弹窗实例
const dialog = useDialog(HelloWorld)   
// 3. 命令式打开弹窗
dialog.$open()                             
```

## 特性

### 核心能力

- **命令式调用**：不预埋模板，不维护显隐状态，随时打开
- **容器与内容解耦**：内容可脱离弹窗，独立复用
- **适配现有组件**：Element Plus、Ant Design Vue、Vuetify 等均可直接使用
- Promise 式调用：`await dialog.$confirm()`
- 响应式参数传递：命令式打开参数也能响应式更新
- 模板插槽投递：支持通过 模板 / JSX 投递插槽
- 上下文继承：自动继承调用处的 provide、$router 等

### 工程特性

- 兼容 Vue 2.7 & Vue 3.3+
- 支持服务端渲染（SSR）
- 支持 Vue DevTools 查看
- 零第三方依赖
- 完整 TypeScript 类型支持
- 100% 测试覆盖

> 当项目里的弹窗超过 5 个，或者开始出现弹窗内容复用的需求时，不妨试试 vue-layerx

*结合后续的示例与 API 说明，只需 5 - 8 分钟即可成为 vue-layerx 高手。*

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

## 目录

<!-- toc -->

- [示例](#示例)
  - [基本用法](#基本用法)
  - [关闭弹窗](#关闭弹窗)
  - [Promise 式打开弹窗并等待结果](#promise-式打开弹窗并等待结果)
  - [内容组件配置](#内容组件配置)
  - [插槽投递](#插槽投递)
  - [配置逻辑与优先级](#配置逻辑与优先级)
- [对比](#对比)
  - [与传统写法](#与传统写法)
  - [与其它命令式方案](#与其它命令式方案)
- [API](#api)
  - [createLayer](#createlayer)
  - [useLayer](#uselayer)
  - [defineLayer](#definelayer)
  - [LayerInstance](#layerinstance)
  - [LayerTemplate](#layertemplate)
  - [LayerNoContainer](#layernocontainer)
  - [类型](#类型)
- [License](#license)

<!-- tocstop -->

## 示例

### 基本用法

vue-layerx 将弹窗拆成两部分：**弹窗容器**（如 `ElDialog`）和 **弹窗内容**（如 `UserForm`）。下面三步依次绑定容器、绑定内容、打开弹窗，每一步都可以传入配置。

#### 1. 用弹窗组件创建专属组合式函数

```ts
// src/composables/dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

可以给 `ElDialog` 传入配置：

```ts
export const useDialog = createLayer(ElDialog, { 
  // props 原样传给 ElDialog
  props: { width: '480px', appendToBody: true } 
})
```

配置可以是响应式的：

```ts
const width = ref('480px')
export const useDialog = createLayer(ElDialog, () => ({ 
  props: { width: width.value, appendToBody: true } 
}))
```

#### 2. 使用弹窗组合式函数创建弹窗实例

```ts
// src/views/UserList.vue setup
import { useDialog } from '@/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)
```

同样可以给 UserForm 传入配置：

```ts
const dialog = useDialog(UserForm, {
  // props 原样传给 UserForm
  props: { mode: 'edit' }
})
```

响应式支持：

```ts
const mode = ref('edit')
const dialog = useDialog(UserForm, () => ({
  props: { mode: mode.value }
}))
```

#### 3. 在任意场景调用实例方法

```ts
// src/views/UserList.vue setup 或 template

// 打开弹窗
dialog.$open()
// 打开弹窗并向 UserForm 传递参数
dialog.$open({ id: 1 })
// 等价于 open({ props })，即：$open(props) ≡ open({ props })
dialog.open({ props: { id: 1 } })

// 关闭弹窗
dialog.close()
```

> 打开状态下再次 `$open` / `open` 会**整体替换**上一次的 open 配置：`$open({ id: 1 })` 后 `$open({ mode: 'create' })`，`id` 参数会被覆盖。

> `createLayer` 的配置侧重弹窗容器，`useDialog` / `open` 的配置侧重弹窗内容，完整规则见 [配置逻辑与优先级](#配置逻辑与优先级)。

相关 API：[createLayer](#createlayer) · [useLayer](#uselayer) · [LayerInstance](#layerinstance)

### 关闭弹窗

除了 `dialog.close()`，可以配置在内容组件的某些事件发生时关闭弹窗：

```ts
const dialog = useDialog(UserForm, {
  closeOn: ['cancel'],
})
```

> 如果 `useDialog` 在组件的 setup 内执行，当组件卸载时，对应的弹窗实例会自动卸载并关闭

相关 API：[CloseOnRaw](#closeonraw)

### Promise 式打开弹窗并等待结果

支持 `await dialog.$confirm({ mode: "create" })`

此时，弹窗的“打开-关闭”会变成 `promise` 的 “`pending`-`settled`”

默认情况下，弹窗的所有关闭行为都会导致 `promise` 状态变为 `reject`，需要配置：

```ts
const dialog = useDialog(UserForm, {
  closeOn: ['cancel', { 
    event: 'ok', // 任意需要触发 resolve 的事件
    when: 'always',
    confirmed: true
  }],
})

// 手动调用时可以这样
dialog.close({ confirmed: true })
// 支持传递参数
dialog.close({ confirmed: true, args: ['任意参数'] })
```

配置后就可以：

```ts
const {
  data // 携带参数列表的首位：args[0]，类型为 unknown
  // ...其它参数见 API LayerConfirmResult
} = await dialog.$confirm({ mode: "create" })
if (data === '任意参数') {
  // ...
}
```

如果还需要处理除了 `confirmed` 外的其它关闭场景（取消、容器关闭按钮、组件卸载等）：

```ts
import { LayerConfirmError } from 'vue-layerx'

try {
  const { data } = await dialog.$confirm({ mode: "create" })
  // ...
} catch (e) {
  // 此处仅为 ts 类型收窄
  if (!(e instanceof LayerConfirmError)) throw e
  // e.code 'close' | 'busy'
  // e.result 关闭结果，仅 code 为 'close' 时有
  // e.result?.data 携带参数列表的首位：args[0]
}
```

> - 打开状态的弹窗，调用 `confirm` / `$confirm` 会直接 reject（`code: 'busy'`）；
> - 处于 `confirm` / `$confirm` 打开中的弹窗，调用 `open` / `$open` 会被忽略；
> - `confirmed` 只在关闭弹窗时生效，无法在弹窗保持打开时 resolve；例如 `when` 函数返回 `false` 时弹窗不关闭，`promise` 也继续 `pending`；

相关 API：[LayerConfirmResult](#layerconfirmresult) · [LayerConfirmError](#layerconfirmerror) · [LayerCloseOptions](#layercloseoptions)

### 内容组件配置

关闭行为、标题等逻辑上来自内容组件，可以在内容组件内配置：

```ts
// src/views/UserForm.vue setup
import { defineLayer } from 'vue-layerx'

defineEmits(['ok', 'cancel'])

// 通过 defineLayer 配置内容在弹窗内时的行为
defineLayer({
  content: {  // 注意这边要包在 content 内
    closeOn: ['cancel', {
      event: 'ok',
      when: 'always',
      confirmed: true,
    }],
  },
})
```

`defineLayer` 还支持给弹窗容器组件传递参数：

```ts
defineLayer({
  // 传给弹窗容器
  props: { title: '编辑用户' },
})
```

也可以响应式地处理 props

```ts
const props = defineProps<{ mode?: 'create' | 'edit' }>()

// 支持响应式参数
defineLayer(() => ({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
  },
}))
``` 

通过 `defineLayer` 可以将内容在弹窗内的使用方式集中配置。调用处只创建实例并打开：

```ts
// src/views/UserList.vue setup
import { useDialog } from '@/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)

// 标题随 mode 变化，关闭事件已在 UserForm 里配好
dialog.$open({ mode: 'edit' })
dialog.$open({ mode: 'create' })
```

> - `defineLayer` 必须在 `setup` 内同步调用；
> - `defineLayer` 的配置只在 `UserForm` **直接作为** 弹窗内容时有效，`UserForm` 作普通组件使用时不受影响（可以作为正常组件嵌套在弹窗内容组件内）

相关 API：[defineLayer](#definelayer)

### 插槽投递

不论是通过模板投递还是通过 JSX 投递，vue-layerx 都支持。按使用场景划分如下：

#### 调用方投给弹窗容器

模板投递需要使用 `LayerTemplate` 组件：

```vue
<!-- src/views/UserList.vue -->
<script setup lang="ts">
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '@/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)
</script>

<template>
  <button @click="dialog.$open()">编辑</button>

  <!-- container 表示投递给弹窗容器 -->
  <LayerTemplate :to="dialog" container name="footer">
    <button @click="dialog.close()">关闭</button>
  </LayerTemplate>
</template>
```

也可以通过 `useDialog` 传入 JSX 配置：

```tsx
const dialog = useDialog(UserForm, {
  container: {
    slots: {
      footer: () => <button onClick={() => dialog.close()}>关闭</button>,
    },
  },
})
```

#### 调用方投给弹窗内容

不加 `container` 时，投递给弹窗内容组件：

```vue
<!-- src/views/UserList.vue -->
<LayerTemplate :to="dialog" name="extra">
  <span>仅这次附带的说明</span>
</LayerTemplate>
```

弹窗内容组件里需要声明插槽

```vue
<!-- src/views/UserForm.vue -->
<template>
  <ElForm />
  <slot name="extra" />
</template>
```

`useDialog` 内的写法：

```tsx
const dialog = useDialog(UserForm, {
  slots: {
    extra: () => <span>仅这次附带的说明</span>,
  },
})
```

#### 弹窗内容投给弹窗容器

弹窗内容里使用 `LayerTemplate` 时，`:to` 用 `defineLayer()` 的返回值：

```vue
<!-- src/views/UserForm.vue -->
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits(['ok', 'cancel'])

const layer = defineLayer({
  props: { title: '编辑用户' },
})
</script>

<template>
  <ElForm />

  <LayerTemplate :to="layer" name="footer">
    <button @click="emit('ok')">确定</button>
    <button @click="emit('cancel')">取消</button>
  </LayerTemplate>
</template>
```

> LayerTemplate 包裹的模板仅在 UserForm 作为弹窗内容时才有效

也可以通过 `defineLayer` 传入 JSX 配置：

```tsx
const emit = defineEmits(['ok', 'cancel'])

defineLayer({
  props: { title: '编辑用户' },
  slots: {
    footer: () => (
      <>
        <button onClick={() => emit('ok')}>确定</button>
        <button onClick={() => emit('cancel')}>取消</button>
      </>
    ),
  },
})
```

> 与 Vue 一致，如果目标组件内没有声明插槽时，会正常投递但不会渲染内容。

相关 API：[LayerTemplate](#layertemplate) · [defineLayer](#definelayer)

### 配置逻辑与优先级

回顾 [基本用法](#基本用法)：vue-layerx 将弹窗拆成 **弹窗容器** 和 **弹窗内容**，并按使用步骤 **分层** 配置。

不同分层的配置有不同侧重，但大体结构是一致的，如表格：

<table>
<tr>
<th>优先级</th>
<th>侧重容器</th>
<th>侧重内容</th>
</tr>
<tr>
<td>
从上到下<br />从低到高
</td>
<td>

```js
{
  component, // 容器组件
  props,     // 容器 props
  slots,     // 容器插槽 JSX
  model,     // 容器 v-model 的 prop 名
  content: {
    component, // 内容组件
    props,     // 内容 props
    slots,     // 内容插槽 JSX
    closeOn,   // 触发关闭的内容事件
  },
}
```

</td>
<td>

```js
{
  component, // 内容组件
  props,     // 内容 props
  slots,     // 内容插槽 JSX
  closeOn,   // 触发关闭的内容事件
  container: {
    component, // 容器组件
    props,     // 容器 props
    slots,     // 容器插槽 JSX
    model,     // 容器 v-model 的 prop 名
  },
}
```

</td>
</tr>
<tr>
<td>容器组件全局</td>
<td><code>createLayer(component, { ... })</code>
</td>
<td></td>
</tr>
<tr>
<td>内容组件内</td>
<td><code>defineLayer({ ... })</code></td>
<td></td>
</tr>
<tr>
<td>具体弹窗实例</td>
<td></td>
<td><code>useDialog(component, { ... })</code></td>
</tr>
<tr>
<td>具体某次打开</td>
<td></td>
<td><code>open({ ... })</code><br /><code>confirm({ ... })</code></td>
</tr>
</table>

配置遵循就近原则：越接近具体弹窗实例或某次打开操作，优先级越高。

- 同一个配置，优先级高会覆盖优先级低的
- 不同位置的配置间会相互合并

<table>
<tr>
<th>同位置：覆盖</th>
<th>不同位置：合并</th>
</tr>
<tr>
<td>

```js
createLayer(ElDialog, {
  props: { title: '默认标题' },
})

const dialog = useDialog(UserForm, {
  container: { props: { title: '用户表单' } },
})

dialog.open({
  component: UserDetail,
  container: { props: { title: '编辑用户' } },
})
```

</td>
<td>

```js
createLayer(ElDialog, {
  props: { width: '500px' },
})

const dialog = useDialog(UserForm, {
  props: { mode: 'detail' },
  container: { props: { title: '用户表单' } },
})

dialog.open({
  props: { id: 1 },
})
```

</td>
</tr>
<tr>
<td>

```js
{
  container: {
    component: ElDialog,
    props: { title: '编辑用户' },
  },
  content: {
    component: UserDetail,
  },
}
```

</td>
<td>

```js
{
  container: {
    component: ElDialog,
    props: { width: '500px', title: '用户表单' },
  },
  content: {
    component: UserForm,
    props: { id: 1, mode: 'detail' },
  },
}
```

</td>
</tr>
</table>

> `createLayer` 还支持 `adapter` 用于转换最终配置，通常在 `AOP` 编程和全局强控配置时使用

相关 API：[LayerConfigCreate](#layerconfigcreate) · [LayerConfigUse](#layerconfiguse) · [LayerConfigContainer](#layerconfigcontainer)

## 对比

### 与传统写法

传统写法通常把弹窗和内容封装成 `UserDialog`，组件内要手动透传弹窗属性，调用方预埋组件、维护 `visible` 状态，并通过中间变量传参；内容与弹窗绑定在一起，想换个弹窗或脱离弹窗复用时只能再拆一次。vue-layerx 下，内容就是普通组件，弹窗属性直接交给容器：

<table>
<tr>
<th>传统写法</th>
<th>vue-layerx</th>
</tr>
<tr>
<td>

```vue
<!-- UserDialog.vue -->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const visible = defineModel<boolean>()
defineProps<{ id?: number }>()
</script>

<template>
  <!-- 透传 width 等弹窗属性 -->
  <ElDialog
    v-bind="$attrs"
    v-model="visible"
    title="编辑用户"
  >
    <ElForm />
  </ElDialog>
</template>
```

</td>
<td>

```vue
<!-- UserForm.vue -->
<script setup lang="ts">
defineProps<{ id?: number }>()
defineLayer({ props: { title: '编辑用户' } })
</script>

<template>
  <ElForm />
</template>
```

</td>
</tr>
<tr>
<td>

```vue
<!-- UserList.vue -->
<script setup lang="ts">
const visible = ref(false)
const currentId = ref<number>()

function edit(id: number) {
  currentId.value = id
  visible.value = true
}
</script>

<template>
  <UserDialog
    v-model="visible"
    :id="currentId"
    width="600px"
  />
</template>
```

</td>
<td>

```vue
<!-- UserList.vue -->
<script setup lang="ts">
const dialog = useDialog(UserForm, {
  container: { props: { width: '600px' } },
})

function edit(id: number) {
  dialog.$open({ id })
}
</script>
```

</td>
</tr>
</table>

### 与其它命令式方案

常见的命令式弹窗方案多基于 `render` 动态挂载渲染组件，往往与调用处的上下文脱节。vue-layerx 同样独立挂载，但会桥接调用处的组件上下文，并把容器与内容拆开管理：

| 对比项 | 传统写法 | 常见命令式方案 | vue-layerx |
| --- | --- | --- | --- |
| 命令式打开 | ❌ | ✅ | ✅ |
| 容器与内容拆分 | ❌ 内容写在弹窗模板内 | ⚠️ 容器通常内置 | ✅ 容器、内容独立定义与复用 |
| 适配项目已有弹窗 | ✅ | ⚠️ 多为内置弹窗，或需二次封装 | ✅ 直接传入 ElDialog 等组件 |
| 模板插槽 | ✅ | ❌ 通常只能写渲染函数 | ✅ 模板 / JSX 均可 |
| 上下文继承 | ✅ | ⚠️ 丢失组件级 provide，常需重新注册插件 | ✅ 自动继承调用处的 provide、$router 等 |
| 开发者工具 | ✅ | ⚠️ 支持程度不一 | ✅ 可在 Vue DevTools 中查看 |

## API

### createLayer

用弹窗容器组件创建专属组合式函数（即 `useLayer`，如 `useDialog`）。

```ts
function createLayer(Container, config?): LayerHook
```

#### createLayer 参数

| 参数名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `Container` | 弹窗容器组件，需支持通过 `v-model` 控制显隐 | `Component` | — |
| `config` | 容器的默认配置，支持 ref / getter / computed，见 [LayerConfigCreate](#layerconfigcreate) | `MaybeRefOrGetter<LayerConfigCreate>` | `{}` |

#### createLayer 返回值

返回 `LayerHook`，即下文的 [useLayer](#uselayer)。可用 `LayerHook<PropsOf<typeof ElDialog>>` 显式标注导出类型。

### useLayer

`createLayer` 的返回值（如 `useDialog`），用内容组件创建弹窗实例。
- 在 `setup` 内调用时会自动继承调用处上下文，所在组件卸载时弹窗随之卸载；
- 在 `setup` 外（如模块级单例）调用时，后续可以在某个组件的 `setup` 内调用 `instance.bindHost()` 绑定组件上下文。

```ts
function useLayer(Content?, config?): LayerInstance
```

#### useLayer 参数

| 参数名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `Content` | 弹窗内容组件；可省略，之后在 `open({ component })` 中指定 | `Component` | — |
| `config` | 实例的默认配置，支持 ref / getter / computed，见 [LayerConfigUse](#layerconfiguse) | `MaybeRefOrGetter<LayerConfigUse>` | `{}` |

#### useLayer 返回值

返回弹窗实例，见 [LayerInstance](#layerinstance)。

### defineLayer

在内容组件 `setup` 中同步调用（否则抛错），配置该内容在弹窗中的行为。仅当内容组件被弹窗实例使用时生效。顶层字段指**容器**，内容侧配置（如 `closeOn`）写在 `content` 内。

```ts
function defineLayer(config?): LayerDefine
```

#### defineLayer 参数

| 参数名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `config` | 弹窗配置，支持 ref / getter / computed，见 [LayerConfigContainer](#layerconfigcontainer) | `MaybeRefOrGetter<LayerConfigContainer>` | `{}` |

#### defineLayer 返回值

返回 `LayerDefine`：

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| `exists` | 当前组件的弹窗容器是否存在 | `boolean` |

> 返回值用作 `LayerTemplate` 的 `:to`，不提供 `open` / `close`

### LayerInstance

`useLayer` / `clone` 返回的弹窗实例。

#### LayerInstance 属性

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| `visible` | 弹窗是否打开，只读 | `boolean` |
| `content` | 打开时为内容组件实例，否则为 `null`，只读 | `ComponentPublicInstance \| null` |
| `container` | 打开时为容器组件实例，否则为 `null`，只读 | `ComponentPublicInstance \| null` |

> 以上属性均为响应式 getter（非 `Ref`），可直接用于模板、`computed`，或通过 getter 形式 `watch`：`watch(() => dialog.visible, (visible) => ...)`

#### LayerInstance 方法

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `$open` | 打开弹窗并传递内容 props，`$open(props)` ≡ `open({ props })` | `(props?: LayerPropsInput) => void` |
| `open` | 打开弹窗（配置为普通对象快照，非响应式）；已打开时再次调用会整体替换上次 open 的配置；`confirm` 未结束时调用被忽略。`config` 字段同 `useLayer` 的 config，另可传 `component` | `(config?: LayerConfigContent) => void` |
| `$confirm` | Promise 式打开，`$confirm(props)` ≡ `confirm({ props })` | `(props?: LayerPropsInput) => Promise<LayerConfirmResult>` |
| `confirm` | Promise 式打开；以 `confirmed: true` 关闭时 resolve，否则 reject `LayerConfirmError`；已打开或确认中时 reject `busy`。见 [LayerConfirmResult](#layerconfirmresult)、[LayerConfirmError](#layerconfirmerror) | `(config?: LayerConfigContent) => Promise<LayerConfirmResult>` |
| `close` | 关闭弹窗；`confirmed` 决定 `confirm` 的结果，`args` 为携带的参数，见 [LayerCloseOptions](#layercloseoptions) | `(options?: LayerCloseOptions) => void` |
| `unmount` | 卸载弹窗 DOM；进行中的 `confirm` 会被 reject | `() => void` |
| `clone` | 基于当前实例创建新实例：共享 `createLayer` 的配置，继承 `useLayer` 的配置（不含 `ref`）并合并 `config`；`config` 支持响应式 | `(config?: MaybeRefOrGetter<LayerConfigContent>) => LayerInstance` |
| `bindHost` | 将实例绑定到当前 `setup` 所在组件，继承其 provide、`$router` 等上下文；用于模块级单例。`useLayer` / `clone` 在 `setup` 内调用时已自动绑定，重复绑定同一组件无副作用 | `() => void` |

### LayerTemplate

通过模板向弹窗容器或内容投递具名插槽。

#### LayerTemplate 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `to` | 投递目标（必填）：调用方传弹窗实例，内容组件内传 `defineLayer()` 返回值 | `LayerInstance \| LayerDefine` | — |
| `name` | 目标插槽名（必填） | `string` | — |
| `container` | 仅 `to` 为弹窗实例时有效，投递给容器而非内容 | `boolean` | `false` |
| `visible-outside` | 弹窗外显示：内容组件作为普通组件使用（不在弹窗内）时仍渲染内容 | `boolean` | `false` |

#### LayerTemplate 插槽

| 插槽名 | 说明 | 作用域参数 |
| --- | --- | --- |
| `default` | 投递的内容 | 目标插槽的作用域参数 |

#### LayerTemplate 投递目标

| 写法 | 目标 |
| --- | --- |
| 调用方 `:to="dialog"` | 内容组件的同名插槽 |
| 调用方 `:to="dialog" container` | 容器组件的同名插槽 |
| 内容组件内 `:to="layer"` | 容器组件的同名插槽 |

### LayerNoContainer

透明容器标记组件，用于容器与内容尚未拆分的存量弹窗（如一个文件里 `<el-dialog>` + 表单）：在该组件内 `defineLayer({ component: LayerNoContainer })`，外层不再包裹弹窗容器，调用方用法与普通内容组件一致。显隐 props（按 `model`，默认 `modelValue`）会投影到该组件上，内部弹窗的显隐字段需与 `model` 同名，否则用 `defineLayer({ component: LayerNoContainer, model: 'visible' })` 对齐。

### 类型

#### LayerConfigCreate

`createLayer` 的配置。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `props` | 传给容器组件的 props，类型由 `Container` 推导；可含 `ref` | `LayerPropsInput` | — |
| `slots` | 投递给容器组件的插槽 | `Record<string, (props?) => VNode \| VNode[] \| null>` | — |
| `model` | 容器控制显隐的 `v-model` 属性名 | `string` | Vue 3：`'modelValue'`；Vue 2.7：`'value'` |
| `content` | 内容侧默认配置，可含 `component` / `props` / `slots` / `closeOn` | `object` | — |
| `adapter` | 配置合并完成后、渲染前对配置做最后修改 | `LayerAdapter`，即 `(fragment: LayerConfigFragment) => LayerConfigFragment` | — |

> `LayerConfigCreate` 顶层不含 `component`（由 `Container` 指定）

#### LayerConfigUse

`useLayer` 的配置。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `props` | 传给内容组件的 props，类型由 `Content` 推导；可含 `ref` | `LayerPropsInput` | — |
| `slots` | 投递给内容组件的插槽 | `Record<string, (props?) => VNode \| VNode[] \| null>` | — |
| `closeOn` | 内容组件触发哪些事件时关闭弹窗，见 [CloseOnRaw](#closeonraw) | `CloseOnRaw` | — |
| `container` | 容器侧配置，可含 `component` / `props` / `slots` / `model`；`props` 类型由 `Container` 推导 | `object` | — |

> `LayerConfigUse` 顶层不含 `component`（由 `Content` 指定）

#### LayerConfigContainer

`defineLayer` 的配置。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `component` | 替换容器组件，如 `LayerNoContainer` | `Component` | — |
| `props` | 传给容器组件的 props | `object` | — |
| `slots` | 投递给容器组件的插槽 | `Record<string, (props?) => VNode \| VNode[] \| null>` | — |
| `model` | 容器控制显隐的 `v-model` 属性名 | `string` | — |
| `content` | 内容侧配置，可含 `props` / `slots` / `closeOn` | `object` | — |

#### CloseOnRaw

`closeOn` 由若干条规则组成，每条规则包含三个属性：

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `event` | 监听内容组件的哪个事件 | `string` | — |
| `when` | 什么情况下关闭：`'always'` 总是关闭；`'none'` 不关闭（用于移除低优先级配置中的同名规则）；函数接收事件参数，返回 `true` 时关闭 | `'always' \| 'none' \| (...args) => boolean` | — |
| `confirmed` | 关闭时是否视为确认：为 `true` 时 `confirm()` resolve，否则 reject；`when` 为 `'none'` 时始终为 `false` | `boolean` | `false` |

各种写法等价的完整规则如下：

| 写法 | 等价于 |
| --- | --- |
| `['ok']` | `{ event: 'ok', when: 'always', confirmed: false }` |
| `[{ event: 'ok', when, confirmed }]` | 原样使用；`when` 必填 |
| `{ ok: true }` / `{ ok: 'always' }` | `{ event: 'ok', when: 'always', confirmed: false }` |
| `{ ok: false }` / `{ ok: 'none' }` | `{ event: 'ok', when: 'none', confirmed: false }` |
| `{ ok: (...args) => boolean }` | `{ event: 'ok', when: fn, confirmed: false }` |
| `{ ok: { when, confirmed } }` | `{ event: 'ok', when, confirmed }`；`when` 必填 |

> 数组中的字符串都是事件名，`['none']` 表示监听名为 `none` 的事件

多处配置的 `closeOn` 按事件名合并：
- 不同事件名的规则合并保留；
- 同事件名的规则由高优先级整体替换
- 事件替换后 `when` 为 `'none'` 则移除该事件。

```ts
// 低优先级（如 `defineLayer` 中定义的）
{ ok: { when: 'always', confirmed: true }, cancel: true }
// 高优先级（如 `useLayer` 中定义的）
{ ok: (value) => !!value, cancel: false, close: true }
// 合并结果：ok 被整体替换（confirmed 回到 false）；cancel 被移除；close 增加
{ ok: { when: (value) => !!value, confirmed: false }, close: { when: 'always', confirmed: false } }
```

#### LayerCloseOptions

`close` 的参数。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `confirmed` | 为 `true` 时使进行中的 `confirm` resolve，否则 reject | `boolean` | — |
| `args` | 关闭时携带的参数，写入 `LayerConfirmResult.args` | `unknown[]` | `[]` |

#### LayerConfirmResult

`confirm` / `$confirm` resolve 的值，也是 `LayerConfirmError.result`。

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| `source` | 关闭来源 | `'content' \| 'container' \| 'instance' \| 'unmount'` |
| `event` | 触发关闭的事件名；手动 `close` / `unmount` 时无 | `string` |
| `args` | 关闭时携带的参数列表 | `unknown[]` |
| `data` | 即 `args[0]` | `unknown` |

#### LayerConfirmError

`confirm` / `$confirm` reject 的错误，可从 `vue-layerx` 导入用于 `instanceof` 判断。

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| `code` | `close`：未以 `confirmed: true` 关闭；`busy`：弹窗已打开或确认中 | `'close' \| 'busy'` |
| `message` | 错误消息 | `string` |
| `result` | 关闭结果，仅 `code` 为 `'close'` 时有 | `LayerConfirmResult` |

更多说明见 [文档](https://xuyimingwork.github.io/vue-layerx/api/)。

## License

MIT
