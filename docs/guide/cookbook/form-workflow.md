<script setup>
import DemoBlock from '../../.vitepress/theme/components/DemoBlock.vue'
import Demo from '../../examples/form-workflow/App.vue'
import AppSource from '../../examples/form-workflow/App.vue?raw'
import FormSource from '../../examples/form-workflow/UserForm.vue?raw'
import AuditSource from '../../examples/form-workflow/UserAudit.vue?raw'
import DialogSource from '../../examples/form-workflow/BaseDialog.vue?raw'
import DrawerSource from '../../examples/form-workflow/BaseDrawer.vue?raw'
import LayersSource from '../../examples/form-workflow/layers.ts?raw'
</script>

# 综合案例：用户域 CRUD + 审批

把前面几篇里分散的能力串进一个中后台场景：**新建 / 编辑 / 详情 / 审批**。对照可看：内容与容器拆分、`LayerTemplate` 投递、`defineLayer` / `closeOn`、按场景拆实例；异步用 [vue-asyncx](https://vue-asyncx.js.org/)。

本例要点：

- **业务收在内容里**：API、校验、`closeOn`、操作按钮；列表只听 `*Done` 刷新
- **壳统一 `action`**：`BaseDialog` 底栏（自带取消 + 业务按钮），`BaseDrawer` 标题右侧；内容一律 `LayerTemplate name="action"`。详情 `view` 仍投递带 tooltip 的警告图标，与壳上「取消」并存——内容补充外壳，不覆盖。
- **按场景拆实例（本例）**：`userCreate` / `userEdit` / `userDetail` / `userAudit`，`mode` 与回调写在 `use` 第二参。实际项目也可以只用一个 `UserForm` 实例，在 `open` 时传入 `mode`。
- **审批可页内复用**：`UserAudit` 的 `action` 加 `visible-outside`，用 `layer.exists` 给操作区加页内样式；「平铺审核」直接嵌组件，不经 Drawer。布局更复杂时可用 [VueUse `createReusableTemplate`](https://vueuse.org/core/createreusabletemplate/) 复用多套外壳 markup。

```vue
<LayerTemplate :to="layer" name="action">…</LayerTemplate>
```

<DemoBlock
  :demo="Demo"
  :files="[
    { name: 'App.vue', code: AppSource },
    { name: 'UserForm.vue', code: FormSource },
    { name: 'UserAudit.vue', code: AuditSource },
    { name: 'BaseDialog.vue', code: DialogSource },
    { name: 'BaseDrawer.vue', code: DrawerSource },
    { name: 'layers.ts', code: LayersSource },
  ]"
/>

## 为什么这样拆

按**领域**边界分文件 / 实例，而不是按「是不是弹窗」：

- **用户资料（同一领域）**：新增、编辑、详情都是同一份用户数据与表单，收在 `UserForm`，用 `mode` 区分可写 / 只读即可。
- **审批（另一领域）**：通过 / 驳回、二次确认、结果态是审批流程，不是表单保存的变体，所以另起 `UserAudit`（可嵌套只读 `UserForm` 看字段），而不是给表单再加 `mode: 'audit'`。
- **列表（页面领域）**：`App` 只维护自己的列表；不关心弹层里怎么调 API，只在 `createDone` / `updateDone` / `auditDone` 等事件后 `queryUsers()` 刷新自身。

本例弹层实例按场景拆开（`userCreate` / `userEdit` / `userDetail` / `userAudit`），和上面的领域划分一致；合并为更少实例也可以。

## 结构

| 内容 | 职责 | 容器 |
|------|------|------|
| `UserForm` | `create` / `edit` / `view`（只读）、API、`closeOn`、action | Dialog |
| `UserAudit` | 嵌套 `UserForm mode="view"`；驳回/通过与结果态 | Drawer，或页内平铺 |
| `App` | 列表展示；`on*Done` → 刷新；可选嵌 `UserAudit` | — |

审核接口成功即 `auditDone`（列表刷新）；弹层内点「完成」再 `finish` 关层。页内平铺同样走 `finish`，由页面自行决定是否重置/卸卡。`UserAudit` 里嵌套的 `UserForm` 只当普通只读表单用。
