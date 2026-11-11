<h1 align="center">vue-layerx</h1>

<p align="center">
  English | <a href="./README.md">简体中文</a>
</p>

<p align="center">
  <b>A new paradigm for modal programming</b><br />
  Open layers like route navigation<br />
  Reuse content like ordinary components
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
  📚 <a href="https://xuyimingwork.github.io/vue-layerx/">Docs</a> ·
  🎮 <a href="https://element-plus.run/#eyJBcHAudnVlIjoiPHNjcmlwdCBzZXR1cCBsYW5nPVwidHNcIj5cbmltcG9ydCB7IEVsQnV0dG9uIH0gZnJvbSAnZWxlbWVudC1wbHVzJ1xuaW1wb3J0IEhlbGxvV29ybGQgZnJvbSAnLi9IZWxsb1dvcmxkLnZ1ZSdcbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4vZGlhbG9nJ1xuXG5jb25zdCBkaWFsb2cgPSB1c2VEaWFsb2coSGVsbG9Xb3JsZClcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxFbEJ1dHRvbiBAY2xpY2s9XCJkaWFsb2cub3BlbigpXCI+5omT5byA5by556qXPC9FbEJ1dHRvbj5cbjwvdGVtcGxhdGU+XG4iLCJlbGVtZW50LXBsdXMuanMiOiJpbXBvcnQgRWxlbWVudFBsdXMgZnJvbSAnZWxlbWVudC1wbHVzJ1xuaW1wb3J0IHsgZ2V0Q3VycmVudEluc3RhbmNlIH0gZnJvbSAndnVlJ1xuXG5sZXQgaW5zdGFsbGVkID0gZmFsc2VcbmF3YWl0IGxvYWRTdHlsZSgpXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEVsZW1lbnRQbHVzKCkge1xuICBpZiAoaW5zdGFsbGVkKSByZXR1cm5cbiAgY29uc3QgaW5zdGFuY2UgPSBnZXRDdXJyZW50SW5zdGFuY2UoKVxuICBpbnN0YW5jZS5hcHBDb250ZXh0LmFwcC51c2UoRWxlbWVudFBsdXMpXG4gIGluc3RhbGxlZCA9IHRydWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHlsZSgpIHtcbiAgY29uc3Qgc3R5bGVzID0gWydodHRwczovL2Zhc3RseS5qc2RlbGl2ci5uZXQvbnBtL2VsZW1lbnQtcGx1c0BsYXRlc3QvZGlzdC9pbmRleC5jc3MnLCAnaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9lbGVtZW50LXBsdXNAbGF0ZXN0L3RoZW1lLWNoYWxrL2RhcmsvY3NzLXZhcnMuY3NzJ10ubWFwKChzdHlsZSkgPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpXG4gICAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0J1xuICAgICAgbGluay5ocmVmID0gc3R5bGVcbiAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUpXG4gICAgICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0KVxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQobGluaylcbiAgICB9KVxuICB9KVxuICByZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKHN0eWxlcylcbn1cbiIsInRzY29uZmlnLmpzb24iOiJ7XG4gIFwiY29tcGlsZXJPcHRpb25zXCI6IHtcbiAgICBcInRhcmdldFwiOiBcIkVTTmV4dFwiLFxuICAgIFwianN4XCI6IFwicHJlc2VydmVcIixcbiAgICBcIm1vZHVsZVwiOiBcIkVTTmV4dFwiLFxuICAgIFwibW9kdWxlUmVzb2x1dGlvblwiOiBcIkJ1bmRsZXJcIixcbiAgICBcInR5cGVzXCI6IFtcImVsZW1lbnQtcGx1cy9nbG9iYWwuZC50c1wiXSxcbiAgICBcImFsbG93SW1wb3J0aW5nVHNFeHRlbnNpb25zXCI6IHRydWUsXG4gICAgXCJhbGxvd0pzXCI6IHRydWUsXG4gICAgXCJjaGVja0pzXCI6IHRydWVcbiAgfSxcbiAgXCJ2dWVDb21waWxlck9wdGlvbnNcIjoge1xuICAgIFwidGFyZ2V0XCI6IDMuM1xuICB9XG59XG4iLCJQbGF5Z3JvdW5kTWFpbi52dWUiOiI8c2NyaXB0IHNldHVwPlxuaW1wb3J0IEFwcCBmcm9tICcuL0FwcC52dWUnXG5pbXBvcnQgeyBzZXR1cEVsZW1lbnRQbHVzIH0gZnJvbSAnLi9lbGVtZW50LXBsdXMuanMnXG5zZXR1cEVsZW1lbnRQbHVzKClcbjwvc2NyaXB0PlxuXG48dGVtcGxhdGU+XG4gIDxBcHAgLz5cbjwvdGVtcGxhdGU+XG4iLCJpbXBvcnQtbWFwLmpzb24iOiJ7XG4gIFwiaW1wb3J0c1wiOiB7XG4gICAgXCJ2dWVcIjogXCJodHRwczovL2Zhc3RseS5qc2RlbGl2ci5uZXQvbnBtL0B2dWUvcnVudGltZS1kb21AbGF0ZXN0L2Rpc3QvcnVudGltZS1kb20uZXNtLWJyb3dzZXIuanNcIixcbiAgICBcIkB2dWUvc2hhcmVkXCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9AdnVlL3NoYXJlZEBsYXRlc3QvZGlzdC9zaGFyZWQuZXNtLWJ1bmRsZXIuanNcIixcbiAgICBcImVsZW1lbnQtcGx1c1wiOiBcImh0dHBzOi8vZmFzdGx5LmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQGxhdGVzdC9kaXN0L2luZGV4LmZ1bGwubWluLm1qc1wiLFxuICAgIFwiZWxlbWVudC1wbHVzL1wiOiBcImh0dHBzOi8vZmFzdGx5LmpzZGVsaXZyLm5ldC9ucG0vZWxlbWVudC1wbHVzQGxhdGVzdC9cIixcbiAgICBcIkBlbGVtZW50LXBsdXMvaWNvbnMtdnVlXCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS9AZWxlbWVudC1wbHVzL2ljb25zLXZ1ZUAyL2Rpc3QvaW5kZXgubWluLmpzXCIsXG4gICAgXCJ2dWUtbGF5ZXJ4XCI6IFwiaHR0cHM6Ly9mYXN0bHkuanNkZWxpdnIubmV0L25wbS92dWUtbGF5ZXJ4QGxhdGVzdC9kaXN0L2luZGV4LmpzXCJcbiAgfSxcbiAgXCJzY29wZXNcIjoge31cbn0iLCJIZWxsb1dvcmxkLnZ1ZSI6Ijx0ZW1wbGF0ZT5cbiAg5L2g5aW95LiW55WMXG48L3RlbXBsYXRlPiIsImRpYWxvZy50cyI6ImltcG9ydCB7IGNyZWF0ZUxheWVyIH0gZnJvbSAndnVlLWxheWVyeCdcbmltcG9ydCB7IEVsRGlhbG9nIH0gZnJvbSAnZWxlbWVudC1wbHVzJ1xuXG5leHBvcnQgY29uc3QgdXNlRGlhbG9nID0gY3JlYXRlTGF5ZXIoRWxEaWFsb2csIHsgcHJvcHM6IHsgYXBwZW5kVG9Cb2R5OiB0cnVlIH0gfSkiLCJfbyI6e319">Element Plus</a> ·
  🎮 <a href="https://play.vuetifyjs.com/#eNqlVm1v2zYQ/iusOkAyYEsJkqJbYGdeuwztUKxFE2wfonyQpZPNhCI1knJsBP7vO77oxY6RBSgQIeTdw7vnjuRD3z4FWuWCl3QZ3yvBg4vgKeWEpEEuqpoykF9rTQVXaXBBrMf4MsbE45/WpmUD49aeryB/OGK/VxtjS4NvEhTINaRB59OZXIJ27qvrv2CD485ZiaJhiH7B+R2UYI3h6GAfGl4g7QHOsv1c1UJqypc36mqjgau2KEPUIHcWnwbrBj6+UHpP9yw+s+tSjn/BOKA2w6TK6oNOOsd+GMzi6K60rtVFkuQFx2UFMLqWMQed8LpK5ghLZMM1rWBSiGp+Fr+Lz0+Tgio9tMegqslCikdsLkYZ1G4C2I7LiQRegDSdeV3eg2V7uQ98L+bXtNy+IqdHzs/j0/hnl8WbJixbKJPiWWj0bEH6s/V/0T14zjINGNxmoMh/Y8PubSWj/EEd3gdld/C2Tf9DxdhgJtIdpsSESubJb3UdIwgzTjVUtaF5aSDT9SSrazu0k4XmZJ4zmj/M0qCgGRPL+CdRA49GaXD5FQfkd2udJhbsguDYRZkmg+g4VbmktSYKdOOSuONKPgFem3+EZAUppahIGCe9yRANB+An0ihwWcmuwztyiDNIFBmliTORWY+P+qgjw87xQSa+LVVGeawVtqXLlUtA+tivLpej0wF8rwdUvKUHmdWt03e+d6LN9sNSd8Sxeci6yxzhh3TRGnv1BCmF/JRZ8UEkkNmlrVkwcL4IcIFbgsVHnlFnqwTe5yh8i+MQjb56S8OVL6ESa7jWWwY32RI3m39D/lRBjAIX3TKRFX8IDDEaEzP+bJJHozuboGx4brSM7Ach0chJkqtRo2VGCpE3FXAd/9uA3F4Dg1wj+/Bte4L1ClB2lImhVgDa0MWTUJLoDUYYYQ7dSLvnOI3rDFVCXzFcgzFd/o8ryorIgO2NG/AzzC07G5lEKwml5+jCEg6PxBceRficCLaGMTrvkebINN1rrCvJ3ORhTW4DPZsoNG5Hn1go8mMIDwfFDZyGDHrNv4E1K4qrNUb7grccOGCnTBGh4WTJDcM/x9qjYcG2AIft6C5EsY3xRKDORiaA9e+Ods3sfbefvlf73YzCVrNKxKp4KcSSQVZT1CNRJahJv5ZZRdl29l0shBYXpycn4zP8zvF7h997/H45OTENe57fnrfXEjj+6lQFtdTm7+ONoYN3X4NElShA0SWnJkNcoRygz5Pw18QfzaM68feBGPRSkHLYWKg7K61qtNfcL4xsQfbQdw94AWXWMH3jjHiMlisd+pcpSdqfE2ajPMF96Xyu8QVdX1oMsaA3UxTP9aFa+1he84/V+sU8ccNK/aPXS9uHrBPqVv56k1fBg7700t52xqaJ+nV9nfuxjr1ljn3/nOWZLPwM54oJTZLWi49W5zaTbu1+W3bjwP04QRL2xQ3GZcYU7L+rrc1vczB+6oYXftnu7j8bCcr0">Vuetify</a>
</p>

<p align="center">
  <a href="https://zread.ai/xuyimingwork/vue-layerx"><img src="https://img.shields.io/badge/Ask_Zread-_.svg?style=flat&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff" alt="zread" /></a>
  <a href="https://deepwiki.com/xuyimingwork/vue-layerx"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" /></a>
</p>

Get started in three lines:

```ts
// 1. Create a composable from a layer container component
const useDialog = createLayer(ElDialog)   
// 2. Create a layer instance from an ordinary component
const dialog = useDialog(HelloWorld)   
// 3. Open the layer imperatively
dialog.$open()                             
```

## Features

### Core capabilities

- **Imperative calls**: no pre-mounted templates, no state variables to maintain — open anytime
- **Container and content decoupled**: content can live outside the layer and be reused independently
- **Works with existing components**: Element Plus, Ant Design Vue, Vuetify, and more work out of the box
- Promise-style calls: `await dialog.$confirm()`
- Reactive props: props passed when opening imperatively still update reactively
- Slot delivery: deliver slots via templates / JSX
- Context inheritance: automatically inherits provide, `$router`, etc. from the call site

### Engineering

- Compatible with Vue 2.7 & Vue 3.3+
- Server-side rendering (SSR) support
- Inspectable in Vue DevTools
- Zero third-party dependencies
- Full TypeScript type support
- 100% test coverage

> Once your project has more than 5 dialogs, or you start needing to reuse dialog content, give vue-layerx a try

*With the examples and API reference below, you can master vue-layerx in just 8–12 minutes.*

## Install

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

## Table of Contents

<!-- toc -->

- [Examples](#examples)
  - [Basic usage](#basic-usage)
  - [Closing the layer](#closing-the-layer)
  - [Open with a Promise and await the result](#open-with-a-promise-and-await-the-result)
  - [Content component config](#content-component-config)
  - [Slot delivery](#slot-delivery)
  - [Config stages and priority](#config-stages-and-priority)
  - [Progressive migration](#progressive-migration)
- [Comparison](#comparison)
  - [vs. the traditional approach](#vs-the-traditional-approach)
  - [vs. other imperative solutions](#vs-other-imperative-solutions)
- [API](#api)
  - [createLayer](#createlayer)
  - [useLayer](#uselayer)
  - [defineLayer](#definelayer)
  - [LayerInstance](#layerinstance)
  - [LayerTemplate](#layertemplate)
  - [LayerNoContainer](#layernocontainer)
  - [Types](#types)
- [License](#license)

<!-- tocstop -->

## Examples

### Basic usage

vue-layerx splits a layer into two parts: the **layer container** (e.g. `ElDialog`) and the **layer content** (e.g. `UserForm`). The three steps below bind the container, bind the content, and open the layer; each step accepts its own config.

#### 1. Create a dedicated composable from a layer component

```ts
// src/composables/dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog)
```

You can pass config to `ElDialog`:

```ts
export const useDialog = createLayer(ElDialog, { 
  // props are passed to ElDialog as-is
  props: { width: '480px', appendToBody: true } 
})
```

Config can be reactive:

```ts
const width = ref('480px')
export const useDialog = createLayer(ElDialog, () => ({ 
  props: { width: width.value, appendToBody: true } 
}))
```

#### 2. Create a layer instance with the composable

```ts
// src/views/UserList.vue setup
import { useDialog } from '@/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)
```

You can likewise pass config to UserForm:

```ts
const dialog = useDialog(UserForm, {
  // props are passed to UserForm as-is
  props: { mode: 'edit' }
})
```

Reactivity is supported:

```ts
const mode = ref('edit')
const dialog = useDialog(UserForm, () => ({
  props: { mode: mode.value }
}))
```

#### 3. Call instance methods anywhere

```ts
// src/views/UserList.vue setup or template

// Open the layer
dialog.$open()
// Open the layer and pass props to UserForm
dialog.$open({ id: 1 })
// Equivalent to open({ props }), i.e. $open(props) ≡ open({ props })
dialog.open({ props: { id: 1 } })

// Close the layer
dialog.close()
```

> Calling `$open` / `open` again while the layer is open **fully replaces** the previous open config: after `$open({ id: 1 })`, calling `$open({ mode: 'create' })` drops the `id` prop.

> `createLayer` config focuses on the layer container, while `useDialog` / `open` config focuses on the layer content. See [Config stages and priority](#config-stages-and-priority) for the full rules.

Related API: [createLayer](#createlayer) · [useLayer](#uselayer) · [LayerInstance](#layerinstance)

### Closing the layer

Besides `dialog.close()`, you can configure the layer to close when certain events fire on the content component:

```ts
const dialog = useDialog(UserForm, {
  closeOn: ['cancel'],
})
```

A string entry closes the layer whenever the event fires. To close conditionally, use the object form and specify the condition with `when`:

```ts
const dialog = useDialog(UserForm, {
  closeOn: ['cancel', {
    event: 'ok', // the event that triggers closing the layer
    when: (valid) => valid === true, // receives the ok event's arguments; closes the layer only when it returns true
  }],
})
```

> `when` must be a synchronous function

> In addition, if `useDialog` runs inside a component's setup, the layer instance is automatically closed and unmounted when that component unmounts

Related API: [CloseOnRaw](#closeonraw)

### Open with a Promise and await the result

`await dialog.$confirm({ mode: "create" })` is supported.

The layer's "open → close" then becomes the promise's "`pending` → `settled`".

By default, every way of closing the layer makes the `promise` `reject`. To resolve it, configure:

```ts
const dialog = useDialog(UserForm, {
  closeOn: ['cancel', { // the cancel event closes the layer but rejects
    event: 'ok', // the event that triggers closing the layer
    when: 'always',  // close the layer unconditionally when the ok event is received
    confirmed: true  // resolve as the layer closes
  }],
})

// When calling manually
dialog.close({ confirmed: true })
// Arguments are supported
dialog.close({ confirmed: true, args: ['any value'] })
```

With that in place:

```ts
const {
  data // first item of the args list: args[0], typed as unknown
  // ...other fields: see API LayerConfirmResult
} = await dialog.$confirm({ mode: "create" })
if (data === 'any value') {
  // ...
}
```

To also handle close scenarios other than `confirmed` (cancel, the container's close button, component unmount, etc.):

```ts
import { LayerConfirmError } from 'vue-layerx'

try {
  const { data } = await dialog.$confirm({ mode: "create" })
  // ...
} catch (e) {
  // only for TS type narrowing
  if (!(e instanceof LayerConfirmError)) throw e
  // e.code 'close' | 'busy'
  // e.result close result, only present when code is 'close'
  // e.result?.data first item of the args list: args[0]
}
```

> - Calling `confirm` / `$confirm` on a layer that is already open **rejects** immediately (`code: 'busy'`);
> - Calling `open` / `$open` on a layer opened via `confirm` / `$confirm` is ignored;
> - `confirmed` only takes effect when the layer closes; the promise cannot resolve while the layer stays open. For example, if a `when` function returns `false`, the layer stays open and the promise remains `pending`;

Related API: [LayerConfirmResult](#layerconfirmresult) · [LayerConfirmError](#layerconfirmerror) · [LayerCloseOptions](#layercloseoptions)

### Content component config

Close behavior, the title, and similar logic belong to the content component, so they can be configured inside it:

```ts
// src/views/UserForm.vue setup
import { defineLayer } from 'vue-layerx'

defineEmits(['ok', 'cancel'])

// Use defineLayer to configure how the content behaves inside a layer
defineLayer({
  content: {  // note: this must be wrapped in content
    closeOn: ['cancel', {
      event: 'ok',
      when: 'always',
      confirmed: true,
    }],
  },
})
```

`defineLayer` can also pass props to the layer container component:

```ts
defineLayer({
  // passed to the layer container
  props: { title: 'Edit user' },
})
```

Props can also be handled reactively:

```ts
const props = defineProps<{ mode?: 'create' | 'edit' }>()

// reactive config is supported
defineLayer(() => ({
  props: {
    title: props.mode === 'edit' ? 'Edit user' : 'New user',
  },
}))
``` 

With `defineLayer`, how the content is used inside a layer is configured in one place. The call site only creates the instance and opens it:

```ts
// src/views/UserList.vue setup
import { useDialog } from '@/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)

// The title follows mode; close events are already configured in UserForm
dialog.$open({ mode: 'edit' })
dialog.$open({ mode: 'create' })
```

> - `defineLayer` must be called synchronously inside `setup`;
> - `defineLayer` config only takes effect when `UserForm` is used **directly as** the layer content; it has no effect when `UserForm` is used as an ordinary component (e.g. nested inside another layer content component)

Related API: [defineLayer](#definelayer)

### Slot delivery

vue-layerx supports delivering slots via both templates and JSX. By scenario:

#### From the caller to the layer container

Template delivery uses the `LayerTemplate` component:

```vue
<!-- src/views/UserList.vue -->
<script setup lang="ts">
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '@/composables/dialog'
import UserForm from './UserForm.vue'

const dialog = useDialog(UserForm)
</script>

<template>
  <button @click="dialog.$open()">Edit</button>

  <!-- container means deliver to the layer container -->
  <LayerTemplate :to="dialog" container name="footer">
    <button @click="dialog.close()">Close</button>
  </LayerTemplate>
</template>
```

You can also pass JSX config via `useDialog`:

```tsx
const dialog = useDialog(UserForm, {
  container: {
    slots: {
      footer: () => <button onClick={() => dialog.close()}>Close</button>,
    },
  },
})
```

#### From the caller to the layer content

Without `container`, slots are delivered to the layer content component:

```vue
<!-- src/views/UserList.vue -->
<LayerTemplate :to="dialog" name="extra">
  <span>A note attached only this time</span>
</LayerTemplate>
```

Declare the slot in the layer content component:

```vue
<!-- src/views/UserForm.vue -->
<template>
  <ElForm />
  <slot name="extra" />
</template>
```

Inside `useDialog`:

```tsx
const dialog = useDialog(UserForm, {
  slots: {
    extra: () => <span>A note attached only this time</span>,
  },
})
```

#### From the layer content to the layer container

When using `LayerTemplate` inside layer content, set `:to` to the return value of `defineLayer()`:

```vue
<!-- src/views/UserForm.vue -->
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits(['ok', 'cancel'])

const layer = defineLayer({
  props: { title: 'Edit user' },
})
</script>

<template>
  <ElForm />

  <LayerTemplate :to="layer" name="footer">
    <button @click="emit('ok')">OK</button>
    <button @click="emit('cancel')">Cancel</button>
  </LayerTemplate>
</template>
```

> Templates wrapped in LayerTemplate only take effect when UserForm is the layer content

You can also pass JSX config via `defineLayer`:

```tsx
const emit = defineEmits(['ok', 'cancel'])

defineLayer({
  props: { title: 'Edit user' },
  slots: {
    footer: () => (
      <>
        <button onClick={() => emit('ok')}>OK</button>
        <button onClick={() => emit('cancel')}>Cancel</button>
      </>
    ),
  },
})
```

> As in Vue, if the target component does not declare the slot, delivery still happens but nothing is rendered.

Related API: [LayerTemplate](#layertemplate) · [defineLayer](#definelayer)

### Config stages and priority

Recap from [Basic usage](#basic-usage): vue-layerx splits a layer into a **layer container** and **layer content**, and configures them in **stages** that follow the usage steps.

Each stage of config has a different focus, but the overall structure is the same, as shown below:

<table>
<tr>
<th>Priority</th>
<th>Container-focused</th>
<th>Content-focused</th>
</tr>
<tr>
<td>
Top to bottom<br />low to high
</td>
<td>

```js
{
  component, // container component
  props,     // container props
  slots,     // container slots (JSX)
  model,     // container v-model prop name
  content: {
    component, // content component
    props,     // content props
    slots,     // content slots (JSX)
    closeOn,   // content events that close the layer
  },
}
```

</td>
<td>

```js
{
  component, // content component
  props,     // content props
  slots,     // content slots (JSX)
  closeOn,   // content events that close the layer
  container: {
    component, // container component
    props,     // container props
    slots,     // container slots (JSX)
    model,     // container v-model prop name
  },
}
```

</td>
</tr>
<tr>
<td>Container component, global</td>
<td><code>createLayer(component, { ... })</code>
</td>
<td></td>
</tr>
<tr>
<td>Inside the content component</td>
<td><code>defineLayer({ ... })</code></td>
<td></td>
</tr>
<tr>
<td>A specific layer instance</td>
<td></td>
<td><code>useDialog(component, { ... })</code></td>
</tr>
<tr>
<td>A specific open call</td>
<td></td>
<td><code>open({ ... })</code><br /><code>confirm({ ... })</code></td>
</tr>
</table>

Config follows the proximity principle: the closer to a specific layer instance or a specific open call, the higher the priority.

- For the same option, higher priority overrides lower priority
- Config from different places is merged together

<table>
<tr>
<th>Same key: override</th>
<th>Different keys: merge</th>
</tr>
<tr>
<td>

```js
createLayer(ElDialog, {
  props: { title: 'Default title' },
})

const dialog = useDialog(UserForm, {
  container: { props: { title: 'User form' } },
})

dialog.open({
  component: UserDetail,
  container: { props: { title: 'Edit user' } },
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
  container: { props: { title: 'User form' } },
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
    props: { title: 'Edit user' },
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
    props: { width: '500px', title: 'User form' },
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

> `createLayer` also supports an `adapter` to transform the final config, typically used for `AOP` programming and globally enforced config

Related API: [LayerConfigCreate](#layerconfigcreate) · [LayerConfigUse](#layerconfiguse) · [LayerConfigContainer](#layerconfigcontainer)

### Progressive migration

Existing projects often have components like `UserDialog` that put `<el-dialog>` and a form in a single file; callers have to pre-mount the component and maintain a `visible` state.

If you can't split it yet, just declare `LayerNoContainer` inside the component (no outer layer container is wrapped around it), and it can be opened imperatively like any ordinary content component:

```vue
<!-- src/views/UserDialog.vue -->
<script setup lang="ts">
import { defineLayer, LayerNoContainer } from 'vue-layerx'

defineProps<{ modelValue?: boolean }>()
const emit = defineEmits(['update:modelValue', 'success'])

defineLayer({
  component: LayerNoContainer, // no outer layer container is wrapped around it
  content: { closeOn: ['success'] },
})
</script>

<template>
  <!-- the original el-dialog + form, unchanged -->
  <el-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form><!-- original logic --></el-form>
  </el-dialog>
</template>
```

Callers no longer pre-mount the component or maintain `visible`; they just open it:

```ts
// src/views/UserList.vue setup
import { useDialog } from '@/composables/dialog'
import UserDialog from './UserDialog.vue'

const dialog = useDialog(UserDialog)

dialog.open({ props: { id: 1 } })
```

When you later split it into a pure form, just remove `LayerNoContainer` and the outer `el-dialog`; callers need no changes.

> - The visibility prop (per `model`, default `modelValue`) is projected onto the content component; the inner dialog's visibility field must share the `model` name, otherwise align them with `defineLayer({ component: LayerNoContainer, model: 'visible' })`;
> - If you have many such all-in-one components, you can also create a dedicated composable with `createLayer(LayerNoContainer)`, or specify it per instance with `useDialog(UserDialog, { container: { component: LayerNoContainer } })`

Related API: [LayerNoContainer](#layernocontainer) · [defineLayer](#definelayer)

## Comparison

### vs. the traditional approach

The traditional approach usually wraps the dialog and its content into a `UserDialog`, which brings a few problems:

- **Manual forwarding**: the component has to forward dialog attributes by hand
- **Verbose calls**: the caller pre-mounts the component, maintains a `visible` state, and passes arguments through intermediate variables
- **Hard to reuse**: content is bound to the dialog, so switching dialogs or reusing the content outside one means splitting it apart again

vue-layerx decouples the two, dialog attributes are configured on the container, while the content component focuses purely on business logic:

<table>
<tr>
<th>Traditional</th>
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
  <!-- forward dialog attributes such as width -->
  <ElDialog
    v-bind="$attrs"
    v-model="visible"
    title="Edit user"
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
defineLayer({ props: { title: 'Edit user' } })
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

### vs. other imperative solutions

Common imperative dialog solutions mostly mount components dynamically via `render`, which often disconnects them from the call-site context. vue-layerx also mounts independently, but bridges the call-site component context and manages the container and content separately:

| Aspect | Traditional | Common imperative solutions | vue-layerx |
| --- | --- | --- | --- |
| Imperative open | ❌ | ✅ | ✅ |
| Container / content split | ❌ Content lives in the dialog template | ⚠️ Container is usually built in | ✅ Container and content defined and reused independently |
| Works with existing dialogs | ✅ | ⚠️ Mostly built-in dialogs, or require re-wrapping | ✅ Pass ElDialog and similar components directly |
| Template slots | ✅ | ❌ Usually render functions only | ✅ Templates / JSX both work |
| Context inheritance | ✅ | ⚠️ Component-level provide is lost; plugins often need re-registering | ✅ Automatically inherits provide, `$router`, etc. from the call site |
| DevTools | ✅ | ⚠️ Support varies | ✅ Inspectable in Vue DevTools |

## API

### createLayer

Creates a dedicated composable (i.e. `useLayer`, such as `useDialog`) from a layer container component.

```ts
function createLayer(Container, config?): LayerHook
```

#### createLayer parameters

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| `Container` | Layer container component; must support toggling visibility via `v-model` | `Component` | — |
| `config` | Default container config; supports ref / getter / computed. See [LayerConfigCreate](#layerconfigcreate) | `MaybeRefOrGetter<LayerConfigCreate>` | `{}` |

#### createLayer return value

Returns a `LayerHook`, i.e. [useLayer](#uselayer) below. Use `LayerHook<PropsOf<typeof ElDialog>>` to annotate the exported type explicitly.

### useLayer

The return value of `createLayer` (such as `useDialog`); creates a layer instance from a content component.
- When called inside `setup`, it automatically inherits the call-site context, and the layer is unmounted along with the host component;
- When called outside `setup` (e.g. as a module-level singleton), you can later call `instance.bindHost()` inside some component's `setup` to bind that component's context.

```ts
function useLayer(Content?, config?): LayerInstance
```

#### useLayer parameters

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| `Content` | Layer content component; may be omitted and specified later via `open({ component })` | `Component` | — |
| `config` | Default instance config; supports ref / getter / computed. See [LayerConfigUse](#layerconfiguse) | `MaybeRefOrGetter<LayerConfigUse>` | `{}` |

#### useLayer return value

Returns a layer instance. See [LayerInstance](#layerinstance).

### defineLayer

Called synchronously in the content component's `setup` (throws otherwise) to configure how the content behaves inside a layer. Only takes effect when the content component is used by a layer instance. Top-level fields refer to the **container**; content-side config (such as `closeOn`) goes inside `content`.

```ts
function defineLayer(config?): LayerDefine
```

#### defineLayer parameters

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| `config` | Layer config; supports ref / getter / computed. See [LayerConfigContainer](#layerconfigcontainer) | `MaybeRefOrGetter<LayerConfigContainer>` | `{}` |

#### defineLayer return value

Returns a `LayerDefine`:

| Property | Description | Type |
| --- | --- | --- |
| `exists` | Whether a layer container exists for the current component | `boolean` |

> The return value is used as `:to` for `LayerTemplate`; it does not provide `open` / `close`

### LayerInstance

The layer instance returned by `useLayer` / `clone`.

#### LayerInstance properties

| Property | Description | Type |
| --- | --- | --- |
| `visible` | Whether the layer is open; read-only | `boolean` |
| `content` | The content component instance while open, otherwise `null`; read-only | `ComponentPublicInstance \| null` |
| `container` | The container component instance while open, otherwise `null`; read-only | `ComponentPublicInstance \| null` |

> All properties above are reactive getters (not `Ref`s). Use them directly in templates or `computed`, or `watch` them via a getter: `watch(() => dialog.visible, (visible) => ...)`

#### LayerInstance methods

| Method | Description | Type |
| --- | --- | --- |
| `$open` | Opens the layer and passes content props; `$open(props)` ≡ `open({ props })` | `(props?: LayerPropsInput) => void` |
| `open` | Opens the layer (config is a plain-object snapshot, not reactive); calling again while open fully replaces the previous open config; ignored while a `confirm` is pending. `config` fields match `useLayer`'s config, plus `component` | `(config?: LayerConfigContent) => void` |
| `$confirm` | Promise-style open; `$confirm(props)` ≡ `confirm({ props })` | `(props?: LayerPropsInput) => Promise<LayerConfirmResult>` |
| `confirm` | Promise-style open; resolves when closed with `confirmed: true`, otherwise rejects with `LayerConfirmError`; rejects with `busy` if already open or confirming. See [LayerConfirmResult](#layerconfirmresult), [LayerConfirmError](#layerconfirmerror) | `(config?: LayerConfigContent) => Promise<LayerConfirmResult>` |
| `close` | Closes the layer; `confirmed` decides the `confirm` result and `args` are the carried arguments. See [LayerCloseOptions](#layercloseoptions) | `(options?: LayerCloseOptions) => void` |
| `unmount` | Unmounts the layer DOM; a pending `confirm` is rejected | `() => void` |
| `clone` | Creates a new instance from the current one: shares the `createLayer` config, inherits the `useLayer` config (excluding `ref`) and merges `config`; `config` may be reactive | `(config?: MaybeRefOrGetter<LayerConfigContent>) => LayerInstance` |
| `bindHost` | Binds the instance to the component whose `setup` is currently running, inheriting its provide, `$router`, and other context; intended for module-level singletons. `useLayer` / `clone` bind automatically when called inside `setup`; binding the same component again has no side effects | `() => void` |

### LayerTemplate

Delivers named slots to the layer container or content via templates.

#### LayerTemplate props

| Prop | Description | Type | Default |
| --- | --- | --- | --- |
| `to` | Delivery target (required): a layer instance at the call site, or the return value of `defineLayer()` inside a content component | `LayerInstance \| LayerDefine` | — |
| `name` | Target slot name (required) | `string` | — |
| `container` | Only valid when `to` is a layer instance; delivers to the container instead of the content | `boolean` | `false` |
| `visible-outside` | Render outside the layer: still renders when the content component is used as an ordinary component (not inside a layer) | `boolean` | `false` |

#### LayerTemplate slots

| Slot | Description | Scoped props |
| --- | --- | --- |
| `default` | The delivered content | The target slot's scoped props |

#### LayerTemplate delivery targets

| Usage | Target |
| --- | --- |
| Call site `:to="dialog"` | Same-named slot of the content component |
| Call site `:to="dialog" container` | Same-named slot of the container component |
| Inside content component `:to="layer"` | Same-named slot of the container component |

### LayerNoContainer

A transparent container: when used as the container component, it renders no wrapper and only renders the content component. Intended for content components that ship their own dialog UI (such as `UserDialog`); see [Progressive migration](#progressive-migration) for an example.

| Where | Usage | Best for |
| --- | --- | --- |
| Container component, global | `createLayer(LayerNoContainer)` | Many components of this kind; use a dedicated composable for all of them |
| Inside the content component | `defineLayer({ component: LayerNoContainer })` | Transparent to callers; used like an ordinary content component |
| A specific layer instance | `useDialog(C, { container: { component: LayerNoContainer } })` | One-off cases |
| A specific open call | `open({ container: { component: LayerNoContainer } })` | A single open |

After switching to `LayerNoContainer`:

- Container props (including the visibility `model` and the default props from `createLayer`) are merged into the content component's props, with content props taking precedence on conflicts. The inner dialog's visibility field must share the `model` name; otherwise align them via the `model` config, e.g. `defineLayer({ component: LayerNoContainer, model: 'visible' })`;
- With no outer container to host them, container slots (`slots` and `LayerTemplate`s delivered to the container) are not rendered; slots the caller delivers to the content component are unaffected;
- When specified in `defineLayer`, since `defineLayer` takes effect during setup, opening first renders the container already determined by outer config and then switches to `LayerNoContainer` (unnoticeable in most cases)

### Types

#### LayerConfigCreate

Config for `createLayer`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `props` | Props passed to the container component, typed from `Container`; may include `ref` | `LayerPropsInput` | — |
| `slots` | Slots delivered to the container component | `Record<string, (props?) => VNode \| VNode[] \| null>` | — |
| `model` | The `v-model` prop name the container uses to control visibility | `string` | Vue 3: `'modelValue'`; Vue 2.7: `'value'` |
| `content` | Default content-side config; may include `component` / `props` / `slots` / `closeOn` | `object` | — |
| `adapter` | Makes final changes to the config after merging and before rendering | `LayerAdapter`, i.e. `(fragment: LayerConfigFragment) => LayerConfigFragment` | — |

> `LayerConfigCreate` has no top-level `component` (it is given by `Container`)

#### LayerConfigUse

Config for `useLayer`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `props` | Props passed to the content component, typed from `Content`; may include `ref` | `LayerPropsInput` | — |
| `slots` | Slots delivered to the content component | `Record<string, (props?) => VNode \| VNode[] \| null>` | — |
| `closeOn` | Which content component events close the layer. See [CloseOnRaw](#closeonraw) | `CloseOnRaw` | — |
| `container` | Container-side config; may include `component` / `props` / `slots` / `model`; `props` is typed from `Container` | `object` | — |

> `LayerConfigUse` has no top-level `component` (it is given by `Content`)

#### LayerConfigContainer

Config for `defineLayer`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `component` | Replaces the container component, e.g. `LayerNoContainer` | `Component` | — |
| `props` | Props passed to the container component | `object` | — |
| `slots` | Slots delivered to the container component | `Record<string, (props?) => VNode \| VNode[] \| null>` | — |
| `model` | The `v-model` prop name the container uses to control visibility | `string` | — |
| `content` | Content-side config; may include `props` / `slots` / `closeOn` | `object` | — |

#### CloseOnRaw

`closeOn` consists of rules, each with three properties:

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `event` | Which content component event to listen to | `string` | — |
| `when` | When to close: `'always'` always closes; `'none'` never closes (used to remove a same-named rule from lower-priority config); a function receives the event arguments and closes when it returns `true` | `'always' \| 'none' \| (...args) => boolean` | — |
| `confirmed` | Whether closing counts as confirmation: when `true`, `confirm()` resolves, otherwise it rejects; always `false` when `when` is `'none'` | `boolean` | `false` |

The full rule each shorthand is equivalent to:

| Shorthand | Equivalent to |
| --- | --- |
| `['ok']` | `{ event: 'ok', when: 'always', confirmed: false }` |
| `[{ event: 'ok', when, confirmed }]` | Used as-is; `when` is required |
| `{ ok: true }` / `{ ok: 'always' }` | `{ event: 'ok', when: 'always', confirmed: false }` |
| `{ ok: false }` / `{ ok: 'none' }` | `{ event: 'ok', when: 'none', confirmed: false }` |
| `{ ok: (...args) => boolean }` | `{ event: 'ok', when: fn, confirmed: false }` |
| `{ ok: { when, confirmed } }` | `{ event: 'ok', when, confirmed }`; `when` is required |

> Strings in an array are always event names; `['none']` listens to an event named `none`

`closeOn` from multiple places is merged by event name:
- Rules with different event names are all kept;
- A rule with the same event name is fully replaced by the higher-priority one
- If the replacing rule's `when` is `'none'`, the event is removed.

```ts
// Lower priority (e.g. defined in `defineLayer`)
{ ok: { when: 'always', confirmed: true }, cancel: true }
// Higher priority (e.g. defined in `useLayer`)
{ ok: (value) => !!value, cancel: false, close: true }
// Result: ok is fully replaced (confirmed falls back to false); cancel is removed; close is added
{ ok: { when: (value) => !!value, confirmed: false }, close: { when: 'always', confirmed: false } }
```

#### LayerCloseOptions

Options for `close`.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `confirmed` | When `true`, a pending `confirm` resolves; otherwise it rejects | `boolean` | — |
| `args` | Arguments carried on close, written to `LayerConfirmResult.args` | `unknown[]` | `[]` |

#### LayerConfirmResult

The value `confirm` / `$confirm` resolves with; also `LayerConfirmError.result`.

| Property | Description | Type |
| --- | --- | --- |
| `source` | Where the close came from | `'content' \| 'container' \| 'instance' \| 'unmount'` |
| `event` | The event name that triggered the close; absent for manual `close` / `unmount` | `string` |
| `args` | The list of arguments carried on close | `unknown[]` |
| `data` | Same as `args[0]` | `unknown` |

#### LayerConfirmError

The error `confirm` / `$confirm` rejects with; import it from `vue-layerx` for `instanceof` checks.

| Property | Description | Type |
| --- | --- | --- |
| `code` | `close`: not closed with `confirmed: true`; `busy`: the layer is already open or confirming | `'close' \| 'busy'` |
| `message` | Error message | `string` |
| `result` | Close result; only present when `code` is `'close'` | `LayerConfirmResult` |

See the [docs](https://xuyimingwork.github.io/vue-layerx/api/) for more details.

## License

MIT
