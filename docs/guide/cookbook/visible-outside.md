<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import BeforeDemo from '../../examples/steps/04-visible-outside/before.vue'
import AfterDemo from '../../examples/steps/04-visible-outside/after.vue'
import BeforeFormSource from '../../examples/tutorial/UserFormWithoutOutside.vue?raw'
import AfterFormSource from '../../examples/tutorial/UserForm.vue?raw'
</script>

# §4 visible-outside

::: info 本章新增
`visible-outside` — 页内编辑也要 footer
:::

设置页 `<UserForm mode="edit" />` 页内改姓名，但没有保存按钮——footer 只挂在弹层里。

**问题（无 visible-outside）：**

<DemoBlock :demo="BeforeDemo" />

**解法：给 `LayerTemplate` 加 `visible-outside`：**

<DemoBlock
  :demo="AfterDemo"
  :files="[
    { name: 'UserForm.vue（§4 前）', code: BeforeFormSource },
    { name: 'UserForm.vue（§4 后）', code: AfterFormSource },
  ]"
/>

`mode: 'view'` 仍无 footer——详情只读不需要保存。

## 下一步

[§5 adapt](/guide/cookbook/adapt)
