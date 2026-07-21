# 打开与关闭

有了工厂和内容组件后，用工厂创建**弹层实例**，再命令式开关。

## 创建实例

```vue
<script setup lang="ts">
import HelloWorld from './HelloWorld.vue'
import { useDialog } from './dialog'

const dialog = useDialog(HelloWorld)
</script>

<template>
  <button @click="dialog.open()">打开</button>
  <button @click="dialog.close()">关闭</button>
</template>
```

若内容侧已用 `defineLayer` 配好标题、`closeOn` 等，`open()` 可以不带参数。

## 向内容传参

### open 当次传入

```ts
dialog.open({ props: { id: 1, mode: 'edit' } })
```

在 `useLayer` / `open` / `clone` 里，**顶层 `props` 指内容**（如 `id`、`mode`）。

### useLayer 默认传入

每次打开都要带的参数，可放在创建实例时：

```ts
const dialog = useDialog(HelloWorld, {
  props: { mode: 'edit' },
})

dialog.open({ props: { id: 1 } })
```

## 顶层 props 指哪一侧

| API | 顶层 `props` → |
|-----|----------------|
| `createLayer` / `defineLayer` | **容器**（`title`、`width`） |
| `useLayer` / `open` / `clone` | **内容**（`id`、`mode`） |

另一侧要显式写出字段名：内容侧用 `content`，容器侧用 `container`。

```ts
defineLayer({ props: { title: '编辑用户' } })

dialog.open({
  props: { id: 1 },
  container: { props: { title: '当次标题' } },
})
```

## 常用实例成员

| 成员 | 说明 |
|------|------|
| `open(config?)` | 打开；`config` 为 plain 快照 |
| `close()` | 关闭 |
| `visible` | 只读是否打开 |

更多（`clone`、`confirm`、`bindHost`、refs）见 [实例进阶](/guide/instance)。

## 下一步

[defineLayer](/guide/define-layer) — 在内容组件里声明默认标题与关层行为
