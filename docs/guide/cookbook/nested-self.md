<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/nested-self/App.vue'
import AppSource from '../../examples/nested-self/App.vue?raw'
import DetailSource from '../../examples/nested-self/UserDetail.vue?raw'
</script>

# 详情里再开同款详情

好友详情、关联单据、组织树点进下一级——**同一份** `UserDetail`：页内嵌入、弹层打开、再叠一层同款。每层独立 instance，互不影响。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'UserDetail.vue', code: DetailSource },
  ]"
/>

内容里若要 `useDialog(自己)`，直接 `import` 自身会循环依赖。一种写法是：

```ts
const Self = getCurrentInstance()!.type as Component
const friendDialog = useDialog(Self)
```

这是进阶技巧，不是日常必写模式。
