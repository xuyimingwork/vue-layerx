# 打开与关闭

有了组合式函数（如 `useDialog`）和内容组件之后，先创建**弹层实例**，再 `open` / `close`。

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

## 向内容传参

### 打开时传入（最常用）

```ts
dialog.open({ props: { id: 1, mode: 'edit' } })
```

这里顶层的 `props` 交给**内容组件**（`id`、`mode` 等）。

### 创建实例时写默认

每次打开都要带的参数，可以写在 `useDialog` 的第二参，少在 `open` 里重复：

```ts
const dialog = useDialog(HelloWorld, {
  props: { mode: 'edit' },
})

dialog.open({ props: { id: 1 } })
```

## 顶层 props 指哪一侧

配置里经常出现顶层 `props`，含义取决于写在哪：

| 写在哪里 | 顶层 `props` 给谁 |
|----------|-------------------|
| `createLayer` 第二参 | **容器**（`title`、`width`） |
| `useDialog` / `open` | **内容**（`id`、`mode`） |

若在 `open` 时既要给内容传参、又要改容器标题，内容用顶层 `props`，容器写到 `container` 里：

```ts
dialog.open({
  props: { id: 1 },
  container: { props: { title: '当次标题' } },
})
```

（内容组件里也可以用 `defineLayer` 声明容器默认标题，见下一章。）

## 常用实例能力

| 成员 | 说明 |
|------|------|
| `open(config?)` | 打开弹层 |
| `close()` | 关闭弹层 |
| `visible` | 是否打开（只读 getter，直接读 `dialog.visible`） |

`clone`、`confirm`、模块单例等见 [实例的更多能力](/guide/instance)。

## 可以不传内容组件

`useDialog()` 允许省略内容组件——仍是「有容器」的空壳；改标题、宽度请走 `container:`（顶层 `props` 默认指内容，没有内容时没有落点）。这和「Dialog + 表单还粘在一个文件里」不是一类问题，建模对比见 [容器与内容未拆分](/guide/no-container)。

## 下一步

[在内容组件里配置弹层](/guide/define-layer)
