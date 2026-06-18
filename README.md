# vue-layerx

Vue 3 弹层工厂：用 **一个 content 组件 + 一个 `createLayer` 工厂** 覆盖详情、编辑、新建等场景，无需维护 `v-model` 和重复的 dialog 模板。

## 安装

```bash
pnpm add vue-layerx
# or
npm install vue-layerx
```

**Peer dependency:** Vue `^3.5.0`

## 快速开始

```ts
// layers/detail.ts
import { createLayer } from 'vue-layerx'
import BaseDialog from './BaseDialog.vue'

export const useDetailLayer = createLayer(BaseDialog)
```

```ts
// UserList.vue
import { useDetailLayer } from './layers/detail'
import UserForm from './UserForm.vue'

const userLayer = useDetailLayer(UserForm)

userLayer.show({ props: { mode: 'view', ...row } })   // 详情
userLayer.show({ props: { mode: 'edit', onSubmit } }) // 编辑
```

```vue
<!-- UserForm.vue -->
<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

defineLayer({ props: { title: '用户' }, hideOn: ['submit'] })
</script>

<template>
  <ElInput v-model="name" :disabled="mode === 'view'" />
  <LayerTemplate v-if="mode !== 'view'" name="footer" #default="{ inLayer }">
    <ElButton v-if="inLayer" type="primary" @click="submit">保存</ElButton>
  </LayerTemplate>
</template>
```

## 核心 API

| 导出 | 用途 |
|------|------|
| `createLayer(Layer, defaults?, adapt?)` | 创建弹层工厂，返回 `useX(Content)` |
| `defineLayer(options)` | 在 content 内声明默认 layer 配置 |
| `LayerTemplate` | 声明式投递 layer / content 插槽（`:to` 远程填充 content slot） |

## 文档

```bash
pnpm docs:dev   # 本地文档站
pnpm playground # 交互式 demo
```

教程与 API 详见仓库内 [docs/](docs/) 目录，或克隆后运行 `pnpm docs:dev`。

## 已知限制

- **不支持 SSR**
- 0.0.x 为早期版本，公共 API 可能调整

## 开发

```bash
pnpm install
pnpm test
pnpm build
```

## License

[MIT](LICENSE)
