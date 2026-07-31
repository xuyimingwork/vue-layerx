# 最佳实践

建议先读完侧栏「基础」；下面是项目里写弹层时的**约定清单**，完整场景见文末两篇案例。

## 先内容，再弹层反应

先把内容当成普通业务组件（props in / emits out），再声明它在弹层里的默认契约。`UserForm` + `defineLayer`（含 `closeOn`）大致相当于以前的 `UserDialog`。

不要用「内容如何控制弹窗」思考，而要用「弹窗如何基于内容的**事件**作出反应」。反应不对时，优先查是否缺事件或事件数据不够，而不是给内容注入 `close()`。

详见 [用事件关闭弹层](/guide/close-on)、[设计决策](/guide/design)。

## 确定归内容，取消归壳

| 意图 | 放哪 | 怎么关 |
|------|------|--------|
| 确定 / 保存 / 提交 | **内容**（常经 `LayerTemplate` 投到壳的 `action`） | `emit` + `closeOn` |
| 取消 / 关掉弹层 | **壳**（与 X / 遮罩同一条关层管线） | 容器关层（如 `handleClose`），可选 `beforeClose` |

并排只是 footer 排版，归属不同：内容补充外壳，不覆盖。

**例外**：壳没有取消、页内复用、或按钮语义是「完成某步」而非放弃编辑（例如审核结果页的「完成」）——由内容自管，确认放在 **emit 之前**。壳已提供统一取消时，内容再写一个 `emit('cancel')` + `closeOn` 的取消，容易和 `beforeClose` 分叉，应避免。

示范见 [综合案例](./form-workflow)。

## 离开确认走壳 `beforeClose`

脏数据离开（X / 遮罩 / 壳上取消）用容器的 `beforeClose`，可在内容的 `defineLayer` 里与标题等一起声明。壳上「取消」须走容器内部关层（例如 ElDialog 的 `handleClose()`），**不要**直接 `emit('update:modelValue', false)` 绕过。

成功保存仍走内容 `emit` + `closeOn`，通常不经 `beforeClose`。框架**不**提供 layer 级 `onBeforeClose`。

## `closeOn` / `when` 只管事件条件

- `closeOn`：哪些内容事件触发关层  
- `when`：事件**已经发生**后，对载荷的**同步**判断（须 `=== true`）

异步确认（MessageBox 等）不放在 `when` 里：要么 emit 前处理，要么走壳 `beforeClose`。

## 默认跟内容走

标题、宽度、`closeOn`、`beforeClose` 等默认契约用 `defineLayer` 与内容 co-locate；调用方用 `useDialog` / `open` 覆盖当次行为。详见 [在内容组件里配置弹层](/guide/define-layer)、[配置如何合并](/guide/config-merge)。

## 排错：关不了或不该关

1. 内容是否 `emit` 了约定事件？载荷是否够 `when` 判断？  
2. `closeOn` 是否被 `use` / `open` 盖掉？  
3. 壳取消是否绕过了 `beforeClose`？  
4. 插槽名是否与容器一致？（见 [LayerTemplate](/guide/layer-template)）

## 完整案例

| 场景 | 篇目 |
|------|------|
| 新建 / 编辑 / 详情 / 审批，壳取消与 `beforeClose`，页内复用 | [综合案例：用户域 CRUD + 审批](./form-workflow) |
| 同一详情组件叠多层、自引用 `useDialog` | [详情里再开同款详情](./nested-self) |

相关进阶：[等待弹层结果](/guide/confirm)、[上下文与生命周期](/guide/context-lifecycle)、[用 adapter 统一改配置](/guide/adapter)、[容器与内容未拆分](/guide/no-container)。更全的探索示例见导航栏 **Demos**。
