<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/action-dual-host/App.vue'
import AppSource from '../../examples/action-dual-host/App.vue?raw'
import PanelSource from '../../examples/action-dual-host/NotePanel.vue?raw'
import NestedDemo from '../../examples/action-dual-host/NestedApp.vue'
import NestedAppSource from '../../examples/action-dual-host/NestedApp.vue?raw'
import ReviewSource from '../../examples/action-dual-host/ReviewPanel.vue?raw'
</script>

# 页内与弹层共用操作区

同一内容常会既嵌在页面里，又用弹层打开。操作按钮在弹层里多半要投到壳的 `footer` / `action`，在页内却还要留在正文旁边。

`LayerTemplate` 默认只投进插槽，原位置不再渲染。两边都要看见时，按**外壳是否相同**选写法：

| 场景 | 做法 |
|------|------|
| 同款操作区，只是多一个落点 | 库内 `visible-outside` |
| 页内 / 弹层外壳不同（嵌套、布局差很多） | 内层 markup 复用一次，外壳按 `layer.exists` 分叉（本篇用 VueUse [`createReusableTemplate`](https://vueuse.org/core/createreusabletemplate/) 示范；也可用别的模板复用手段） |

关层仍走 `emit` + `closeOn`，不要按 `exists` 分支去关。

## 场景一：同款操作区 · `visible-outside`

仍包在同一个 `LayerTemplate` 里：弹层投进目标槽，页内就地再渲一份。markup 与样式两边一致，不必用 `exists` 切 class——留白交给正文布局或壳的 footer 即可。

```vue
<LayerTemplate :to="layer" name="footer" visible-outside>
  <ElButton @click="emit('preview', text)">预览</ElButton>
  <ElButton type="primary" @click="emit('save', text)">保存</ElButton>
</LayerTemplate>
```

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'NotePanel.vue', code: PanelSource },
  ]"
/>

下一篇 [综合案例](./form-workflow) 的审批页内复用，也是这一场景。

## 场景二：页内 / 弹层外壳不同

若一边是侧栏竖排 + 标题，一边是 footer 横排，外壳已经不是「同一块」。这时不宜再靠 `visible-outside` 硬撑同一棵树；应把**内层操作组**复用一次，外壳按 `exists` 各写一套。

下面用 VueUse 的 `createReusableTemplate` 做示范（**外部可选依赖**，不是 vue-layerx 的能力）：

```ts
const { define: DefineActions, reuse: ReuseActions } = createReusableTemplate()
```

```vue
<DefineActions>…驳回 / 更多 / 通过…</DefineActions>

<LayerTemplate v-if="layer.exists" :to="layer" name="footer">
  <div class="footer-actions"><ReuseActions /></div>
</LayerTemplate>
<aside v-else class="side-panel">
  <p class="side-panel__title">审核操作</p>
  <div class="side-panel__stack"><ReuseActions /></div>
</aside>
```

<DemoBlock
  :demo="NestedDemo"
  :files="[
    { name: 'NestedApp.vue', code: NestedAppSource },
    { name: 'ReviewPanel.vue', code: ReviewSource },
  ]"
/>

## 下一步

综合业务串场见 [综合案例：用户域 CRUD + 审批](./form-workflow)。`LayerTemplate` 基础用法见 [向弹层投递插槽](/guide/layer-template)。
