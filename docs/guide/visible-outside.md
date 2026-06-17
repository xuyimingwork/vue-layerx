<script setup>
import DemoBlock from '../.vitepress/theme/components/DemoBlock.vue'
import BeforeDemo from '../examples/steps/04-visible-outside/before.vue'
import AfterDemo from '../examples/steps/04-visible-outside/after.vue'
import BeforeSource from '../examples/steps/04-visible-outside/before.vue?raw'
import AfterSource from '../examples/steps/04-visible-outside/after.vue?raw'
import FormSource from '../examples/tutorial/UserFormWithOutside.vue?raw'
</script>

# §4 visible-outside

::: info 本章新增
`visible-outside` · `{ inLayer, outsideLayer }`
:::

**先有需求，再引概念。** 前面 `UserForm` 只服务弹层；设置页要页内改姓名，却发现没有保存按钮——因为 footer 只挂在 BaseDialog 里。

## 问题

<DemoBlock :demo="BeforeDemo" :files="[{ name: 'SettingsPage.vue（缺保存按钮）', code: BeforeSource }]" />

## 解法：一行 visible-outside

<DemoBlock
  :demo="AfterDemo"
  :files="[
    { name: 'SettingsPage.vue', code: AfterSource },
    { name: 'UserForm.vue（仅 diff）', code: FormSource },
  ]"
/>

```vue
<LayerTemplate name="footer" visible-outside>
  <template #default="{ inLayer, outsideLayer }">
    <div v-if="outsideLayer">页内保存按钮</div>
    <ElButton v-else-if="inLayer">弹层保存按钮</ElButton>
  </template>
</LayerTemplate>
```

| 模式 | 保存按钮 |
|------|----------|
| 页内 | 表单下方 |
| 弹层 | BaseDialog footer 右 |

**UserDetail 不需要这个**——详情只读，没有「保存」。

## 下一步

列表详情在窄屏改 Drawer：[§5 useDetailLayer + adapt](/guide/adapt)
