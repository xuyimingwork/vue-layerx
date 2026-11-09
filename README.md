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

- **命令式调用**：不预埋模板，不维护变量，随时打开
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

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

## 示例

### 基本用法

1. 用弹窗组件创建专属组合式函数

```ts
// src/composables/dialog.ts
import { ref } from 'vue'
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)

// 可以给弹窗组件传递参数
export const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})

// 也支持响应式参数
const width = ref('480px')
export const useDialog = createLayer(ElDialog, () => ({
  props: { width: width.value, appendToBody: true },
}))
```

2. 使用弹窗组合式函数创建弹窗实例

```ts
// src/views/UserList.vue setup
import { useDialog } from 'src/composables/dialog'
import UserForm from './UserForm.vue'
import { ref } from 'vue'

// 传入普通组件做弹窗内容，得到弹窗实例
const dialog = useDialog(UserForm)

// 可以给内容组件传递参数
const dialog = useDialog(UserForm, {
  props: { mode: 'edit' },
})

// 支持响应式参数
const mode = ref('edit')
const dialog = useDialog(UserForm, () => ({
  props: { mode: mode.value },
}))
```

3. 在任意场景调用实例方法

```ts
// src/views/UserList.vue setup 或 template

// 打开弹窗并向内容组件传递参数
dialog.$open({ id: 1 })
// 或者用 open，$open(props) ≡ open({ props })
dialog.open({ props: { id: 1 } })

// 关闭弹窗
dialog.close()
```

> dialog 打开状态下再次 `dialog.$open({ id: 2 })`，内容组件的 props 会响应式更新

### 关闭弹窗

除了 `dialog.close()`，可以配置内容组件的某些事件发生时关闭弹窗：

```ts
const dialog = useDialog(UserForm, {
  closeOn: ['cancel'],
})
```

> `useDialog` 所在的组件卸载时，弹窗会自动卸载并关闭

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
  data // 携带参数列表的首位：args?.[0]
  // ...其它参数见文档
} = await dialog.$confirm({ mode: "create" })
if (data === '任意参数') {
  // ...
}
```

如果还需要处理除了 `confirmed` 外的其它关闭场景：

```ts
try {
  const { data } = await dialog.$confirm({ mode: "create" })
  // ...
} catch (e) {
  // e.code 'close' | 'busy'
  // e.message 错误消息
  // e.result 错误数据，仅 code 为 'close' 时有
  // e.result?.data 携带参数列表的首位：args?.[0]
  // ... e.result 的其它属性
}
```

> 通过 `$confirm` 开启的弹窗，开启过程中不能调用 `$confirm` 或 `$open` 再次打开

### 内容组件配置

使用时配置内容组件的关闭事件有些繁琐，还可以在内容组件内直接配置：

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

> `defineLayer` 的配置只在 `UserForm` 被 `useDialog` 使用时生效

`defineLayer` 还支持给弹窗容器组件传递参数：

```ts
defineLayer({
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
import { useDialog } from 'src/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)

// 标题随 mode 变化，关闭事件已在 UserForm 里配好
dialog.$open({ mode: 'edit' })
dialog.$open({ mode: 'create' })
```

### 插槽投递

不论是通过模板投递还是通过 JSX 投递，vue-layerx 都支持。按使用场景划分如下：

#### 调用方投给弹窗容器

模板投递需要使用 `LayerTemplate` 组件：

```vue
<!-- src/views/UserList.vue -->
<script setup lang="ts">
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from 'src/composables/dialog'
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

## License

MIT
