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

vue-layerx is a Vue layer orchestration framework that turns existing Dialog / Drawer / Popup components into programmable overlays.

It does not replace your UI components. Instead, it sits on top of them and provides unified lifecycle management, dynamic rendering, and a business-friendly calling style.

Open a layer with three lines of code:

```ts
const useDialog = createLayer(ElDialog)   // any existing overlay container
const dialog = useDialog(HelloWorld)      // ordinary component as layer content
dialog.open()                             // open imperatively
```

## Features

- Open layers like route navigation: no local state, no pre-mounted templates — call an API and go
- Layer content is just a normal component: no special wrappers required, better reuse
- Reactive props: keeps Vue’s native reactivity
- Slot delivery: still use Vue slots when opening layers imperatively
- Unified API for Vue 3.3+ and Vue 2.7
- Zero runtime dependencies: no third-party npm packages
- Written in TypeScript with full type definitions
- 100% unit test coverage for core stability
- Server-side rendering (SSR) support

## Install

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

## Usage

### Create a composable

Any layer **container component** can be turned into a composable with `createLayer`. For example, with a Dialog:

```ts
// src/composables/dialog.ts
import { createLayer } from 'vue-layerx'
import { ElDialog } from 'element-plus'

export const useDialog = createLayer(ElDialog, {
  props: { width: '480px', appendToBody: true },
})
```

> Layer: a general term for overlay UI such as Dialog, Drawer, Popup, and similar patterns.

### Open a layer

Pass a **content component** to get a layer instance, then `$open` it with content props:

```vue
<script setup lang="ts">
import UserForm from './UserForm.vue'
import { useDialog } from '@/composables/dialog'

const dialog = useDialog(UserForm)
</script>

<template>
  <button @click="dialog.$open({ id: 1 })">Edit user</button>
</template>
```

### Content component

Each of the following `UserForm.vue` examples can be opened by the snippet above. They only add layer contracts on the content side, step by step.

**1. Receive props**

Content is an ordinary component. Fields passed to `$open` map to `defineProps`:

```vue
<script setup lang="ts">
defineProps<{ id: number }>()
</script>

<template>
  <p>Editing user {{ id }}</p>
</template>
```

**2. Declare a title**

Use `defineLayer` to configure how the content behaves inside a dialog — the title, for example:

```vue
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

defineProps<{ id: number }>()

defineLayer({
  props: { title: 'Edit user' }, // for the container
})
</script>

<template>
  <p>Editing user {{ id }}</p>
</template>
```

**3. Close the dialog**

To let the content close the dialog, declare which events should close it with `closeOn`. Content only `emit`s — do not call `close()`:

```vue
<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

const props = defineProps<{ id: number }>()
const emit = defineEmits<{ success: [] }>()

defineLayer({
  props: { title: 'Edit user' },
  content: { closeOn: ['success'] },
})

async function save() {
  await updateUser(props.id) // throw on failure; do not emit
  emit('success')
}
</script>

<template>
  <p>Editing user {{ id }}</p>
  <button @click="save">Save</button>
</template>
```

> Anything declared in `defineLayer` can be overridden at the call site, for example:
>
> ```ts
> const dialog = useDialog(UserForm, {
>   closeOn: { success: false },
> })
> ```

**4. Slot delivery**

To put the Save button in the dialog `footer` slot, deliver it with `LayerTemplate`:

```vue
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const layer = defineLayer({
  props: { title: 'Edit user' },
  content: { closeOn: ['success'] },
})
</script>

<template>
  <p>Editing user {{ id }}</p>
  <LayerTemplate :to="layer" name="footer">
    <button @click="save">Save</button>
  </LayerTemplate>
</template>
```

See [Delivering slots to a layer](https://xuyimingwork.github.io/vue-layerx/guide/layer-template) for details.

### Await a layer result

Use `$open` when you only need to show the layer. Use `$confirm` when you need data back before continuing:

```ts
try {
  const { data } = await dialog.$confirm({ id: 1 })
  // use data
} catch {
  // canceled, or closed via the mask
}
```

`$confirm` requires a confirmed close event, for example:

```ts
defineLayer({
  content: {
    closeOn: {
      success: { when: 'always', confirmed: true },
    },
  },
})
```

See [Awaiting a layer result](https://xuyimingwork.github.io/vue-layerx/guide/confirm) for details.

## Documentation

Full usage, advanced features, and API reference:

- [Guide](https://xuyimingwork.github.io/vue-layerx/guide/introduction)
- [API](https://xuyimingwork.github.io/vue-layerx/api/)

## License

MIT
