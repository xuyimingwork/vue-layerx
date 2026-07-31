# ADR 0010：不提供框架级 `onBeforeClose` / 离开守卫

- **状态**：Accepted（刻意不做）
- **日期**：2026-07-31
- **关联**：[ADR 0005](./0005-content-self-contained-close-on.md)（content 不调 `close`；关层经 emit + `closeOn`）；[DESIGN.md](../../DESIGN.md)「关闭行为」中 `beforeClose` 透传说明；实践 [最佳实践](../guide/cookbook/index.md)、[综合案例](../guide/cookbook/form-workflow.md)

---

## 背景

关层有多条入口，payload `source` 不同：

| 入口 | 典型触发 | `source` |
|------|----------|----------|
| 内容业务完成 | `emit` + `closeOn` | `content` |
| 容器 UI | X / 遮罩 / ESC；壳上「取消」若走容器关层管线 | `container` |
| 命令式 | `LayerInstance.close()` | `instance` |

容器组件（如 Element Plus `ElDialog`）自带 `beforeClose`：在**容器自己的**关闭流程里拦截。vue-layerx 将其视为 **container.props**，merge 后透传，**框架不介入**，与 `closeOn` 无关（见 DESIGN.md）。

产品常有「未保存离开要确认」。容易想到：框架是否应提供类似 `onBeforeRouteLeave` 的 **layer 级** `onBeforeClose` / `beforeLeave`，统一罩住所有 `close` 路径？

同时出现的张力：

- `closeOn.when`：事件级「这次 emit 算不算该关」
- 若再加 `onBeforeClose`：易与 `when` 抢职责，也易与「emit 前自行确认」重复

---

## 问题

1. 是否提供框架级关层守卫（所有 `close` 前可异步 veto）？
2. 若不提供，「脏离开」与「壳自定义取消绕过容器 `beforeClose`」如何落在应用层？
3. `closeOn.when` 是否应承担离开确认（含异步）？

---

## 备选

| | A. 框架 `onBeforeClose` / `beforeLeave` | B. 不做框架守卫；分工落在壳 + 内容 |
|--|----------------------------------------|-------------------------------------|
| 覆盖面 | 理想上含 content / container / instance | 壳通道靠容器 `beforeClose`；内容通道靠 emit 前逻辑 |
| 与 ADR 0005 | 守卫在框架内，content 仍可不持 `close` | 一致：完成只 emit；离开确认不经 content 调 `close` |
| 与 `when` | 需严格分层，否则双闸混乱 | `when` 只做事件关层条件 |
| 成本 | `close` 可中断 / 异步；桥接各 UI 库壳关闭；防与内容确认重复弹窗 | 壳须正确接入容器关层（如 `handleClose`）；文档约定职责 |

---

## 决策

### 1. 不提供框架级 `onBeforeClose` / `beforeLeave` / 同类 API

不在 `defineLayer`、`createLayer`、`LayerInstance` 上增加「任意关层前」的统一守卫。

理由：

1. **真需求很窄**：需要与容器 `beforeClose` 对齐的，主要是 **非 content emit** 的离开（X / 遮罩 / ESC、壳上取消）。内容发起的保存 / 取消应在 **emit 之前**处理（校验失败或不确认则不 emit）——与「信号发出前拦截」一致，不必再挂一层框架钩子。
2. **与 `when` 易糊**：`when` = 事件已发生后、对载荷的同步谓词（「算不算该关」）；离开守卫 = 层是否允许离开。做成并列的 `onBeforeClose` 后，脏检查、成功路径是否放行会长期说不清。异步 `when` 也不能补齐壳通道，且会进一步撑歪 `when`（用户指南：[用事件关闭弹层](../guide/close-on.md)）。
3. **对称的 `onBeforeOpen` 更无必要**：打开是调用方命令式 `open()`，闸门在调用前即可；不为 Close 造一对生命周期 API。
4. **实现与模型成本**：统一守卫要接管所有 `close` 源、异步与 `confirm()` 结算，并与各容器原生 `beforeClose` 避免双弹；收益不足以抵消与「内容通用组件」叙事的复杂度。

### 2. 应用层分工（推荐）

| 意图 | 归属 | 做法 |
|------|------|------|
| 业务完成（确定 / 保存） | **内容** | 校验通过再 `emit`；`closeOn` 关层；不经容器 `beforeClose` |
| 放弃编辑 / 关掉弹层 | **壳** | 取消与 X / 遮罩同一关层管线；`defineLayer` 可 co-locate 透传容器 `beforeClose`（脏确认） |
| 事件是否算「该关」 | **`closeOn.when`** | 同步谓词（如 payload 是否成功）；**不做**离开 MessageBox |

壳上自定义「取消」**不得**直接 `emit('update:modelValue', false)` 绕过容器 `beforeClose`；应走容器内部关层（例如 Element Plus `ElDialog` 的 `handleClose()`），与点 X / 遮罩一致。

内容在壳已提供统一取消时，再写一个 `emit('cancel')` + `closeOn` 的取消，视为反模式（双通道且守卫可能不一致）。页内复用、或壳无取消入口时，内容可自管离开按钮，确认放在 **emit 前**，不要求「走壳的 `beforeClose`」。

### 3. `defineLayer` 可继续声明容器 `beforeClose`

这属于 **container.props 透传**（与 title、width 同类），不是框架发明的离开守卫 API。内容作者最清楚「进弹层时默认如何表现」，与 ADR 0005 的 co-locate 一致；页内嵌入时该配置不生效，不破坏复用。

### 4. 明确非目标

- 不把 `closeOn.when` 扩展为异步离开确认以替代本决策。
- 不为「内容取消按钮也要走壳 `beforeClose`」提供 content → `handleClose` 捷径（等同于给 content 关层能力，与 ADR 0005 冲突）。
- 不要求框架同步 content `closeOn` 与容器 `beforeClose`。

---

## 后果

- API 审查：新增 layer 级 `onBeforeClose` / `beforeLeave` / inject `close` 式离开闸 = 违背本决策（除非将来另开 ADR 推翻）。
- 文档 / 实践：综合案例示范 `BaseDialog` + `handleClose`、内容 `defineLayer` 配 `beforeClose`、成功走 `emit` + `closeOn`。
- DESIGN：维持「`beforeClose` 透传、框架不介入、与 `closeOn` 无关」；本 ADR 解释**为何不升级为框架守卫**。

---

## 决策记录

| 项 | 结论 |
|----|------|
| 框架级 `onBeforeClose` | **不做** |
| 脏离开（壳通道） | 容器 `beforeClose`（可经 `defineLayer` 声明）+ 壳取消走同一关层管线 |
| 业务完成 / 内容离开 | emit 前处理；`closeOn` / `when` 不管 MessageBox 式离开 |
| `when` vs 离开守卫 | `when` 仅事件关层条件；不承担 layer leave |
| 与 ADR 0005 | 兼容并收紧：内容仍无 `close`；完成与离开职责按上表拆分 |
