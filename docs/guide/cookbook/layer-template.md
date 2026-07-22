<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/layer-template/App.vue'
import AppSource from '../../examples/layer-template/App.vue?raw'
import ContentSource from '../../examples/layer-template/HelloContent.vue?raw'
</script>

# 弹层插槽怎么填

命令式 `open()` 时，容器是远程挂上的——没法在页面里直接写 `<ElDialog #footer>`。用 `LayerTemplate` 继续写熟悉的模板，把操作区投到容器插槽，或由调用方往内容里塞一块 header。

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'HelloContent.vue', code: ContentSource },
  ]"
/>

要点：

- **内容里** `:to="layer"` → 投到**容器**插槽（如 footer）
- **调用方** `:to="dialog"` → 投到**内容**上的 `<slot>`
- 调用方再加 `container` → 覆盖容器插槽

语法细节见[用模板填写插槽](/guide/layer-template)。同一内容还要嵌在页面、换 Drawer 打开时，见[内容复用：页内 / Dialog / Drawer](./content-reuse)。
