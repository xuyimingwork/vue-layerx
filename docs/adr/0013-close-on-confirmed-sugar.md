# ADR 0013：`closeOn` 对象形糖 — `{ confirmed: true }`、空对象与 `when` inherit

- **状态**：Deferred（暂不实现；倾向 B；inherit 等反馈）
- **日期**：2026-08-20
- **关联**：[ADR 0005](./0005-content-self-contained-close-on.md)（emit + `closeOn`）；[DESIGN.md](../../DESIGN.md) `closeOn`；[`src/config/close-on.ts`](../../src/config/close-on.ts)；用户指南 [用事件关闭弹层](../guide/close-on.md)、[等待弹层结果](../guide/confirm.md)

---

## 为何暂缓

对象形缺 `when` 时，用户意图几乎总是「这条事件要关，并且标成确认路径」。实现上最贴这份意图、又不把 merge 变成按字段拼的，是：

```ts
{ confirmed: true }  ≡  { when: 'always', confirmed: true }
success: {}          // 仍非法（无效配置）
```

inherit（省略 `when` 时沿用下层非 `none` 的 `when`）更贴「只改结算、保住 `when: fn`」以及「多种事件可 confirm、关掉其中某些」，但那是**覆盖语义**；现网是**替换语义**。当时实现选了整条替换先糊上去，没有把两种语义拆开。覆盖的解释成本和「看到一层配置无法反应行为」在 define / use / clone 多层只拨 `confirmed` 时尤其明显。

**本轮不改实现。** 现网继续 `when` 必填；`{ confirmed: true }` 仍 warn 并忽略。拾起糖时按「倾向 B（替换）」；覆盖（inherit）等到有真实反馈再开。

以下保留讨论，避免重开时从头推演。

---

## 背景

Canonical `closeOn` 每一条是两个正交字段：

| 字段 | 管什么 |
|------|--------|
| `when` | **关不关**（`'always'` / 函数 / `'none'`） |
| `confirmed` | 关了之后，`confirm()` / `$confirm` 是 **resolve 还是 reject** |

Raw 糖（现状）：

```ts
closeOn: ['success']            // ≡ { when: 'always', confirmed: false }
closeOn: { success: true }      // 同上
closeOn: { success: false }     // ≡ { when: 'none', confirmed: false }（tombstone）
closeOn: { success: fn }        // ≡ { when: fn, confirmed: false }
closeOn: { success: { when: 'always', confirmed: true } }  // 关，且确认路径
```

对象形类型现为 **`when` 必填**（注释：禁止无 `when` 的 `confirmed`）。`{ confirmed: true }` 会告警 `object entry requires when; ignored`，整条丢掉。

合并是**按 event 整份 entry 替换**，不按字段叠。`when === 'none'` 不进入最终 fragment（后写覆盖后再滤掉，与 bind 跳过 `none` 对关层行为等价）。`false` 与 `{ when: 'none', confirmed: false }` **单层写法等价**。

日常「只打开」用数组糖即可。要用 `$confirm` 拿到结果，必须走对象形，于是文档得写 `when: 'always'`——而 `closeOn` × 事件名 × `confirmed: true` 从用户视角已经把意图说完。这是糖不对称的来源。

---

## 问题

1. `{ confirmed: true }` 是否应视为有效（关 + 确认路径）？
2. 若有效：省略的 `when` 默成 `'always'`，还是 **inherit**（沿用下层非 `none` 的 `when`，没有则 `'always'`）？
3. 是否另引入 `success: 'confirmed'`？
4. 两维都能省时，`success: {}` 是否合法？

约束：不改两轴模型；不改 `true` / `false` / `'always'` / `'none'` / `fn` 的现有含义；tombstone 语义不变。

---

## 备选（摘要）

| | 缺 `when` 的对象 | 局部可读 | 保住下层 `fn` |
|--|--|--|--|
| **A 现状** | 忽略 | 提到该事件的一层是完整快照 | 须整份抄 `{ when: fn, confirmed: true }` |
| **B** | ≡ `{ when: 'always', confirmed: true }` | 这一层仍是快照（always + 确认） | 否，会整条换成 always |
| **C** `success: 'confirmed'` | — | 短 | 否；且污染 `when` 字符串槽 |
| **D inherit** | 沿用非 none 的 `when`，否则 always | 否，要沿链拼 | 是 |

C 不取：`'always'` / `'none'` 表示关层条件，`'confirmed'` 却是结算，同槽不同轴。

---

## 倾向（拾起时）

取 **B**，并钉死空对象非法：

```ts
{ confirmed: true }   ≡ { when: 'always', confirmed: true }
{ when: fn }          ≡ { when: fn, confirmed: false }          // 已如此
{ when: fn, confirmed: true }                                   // 条件关 + 确认
success: {}           // 无效：warn 并忽略（与今天缺 when 且无 confirmed 相同）
```

- **不 inherit。** `true` / `'always'` 也不变成 inherit，否则 `success: true` 盖不掉下层 `fn`。
- **`confirmed` 不自动 inherit。** 更高层只写 `{ when: fn }` 仍整条替换，`confirmed` 打回 `false`。
- 数组 object `{ event: 'success', confirmed: true }` 与 Record 对象形同一套规则。
- `{ when: 'none', confirmed: true }` 保持强制 `confirmed: false`。
- `{ confirmed: false }` 若一并放开：等同 `true` / `'always'`（关，非确认路径）。不必第一天做。

对已发布的**合法**配置：非 breaking。现网 demo / 指南全是带 `when: 'always'` 的完整对象。只有测试在用 `as never` 断言缺 `when` 被忽略，拾起时改这些测试即可。

---

## 顾虑

### 1. 使用方写 `{ confirmed: true }` 时在想什么

`closeOn` × 事件名 × `confirmed: true` 连在一起，意图几乎总是：

> 这条事件要关层；把它标成确认路径。

他们不会觉得漏了 `when`。`closeOn.success` 已经承担「关」；对象里只剩结算。

两种场合用同一句语法：

| 场合 | 「要关」从哪来 | 若做成 B | 若做成 D |
|------|----------------|----------|----------|
| 单点（`defineLayer` / README） | 本层刚声明 | always + 确认（符合） | 同左（没有下层） |
| 盖在已有 `closeOn` 上 | 下层已有数组糖 / `fn` | **整条换成 always**（条件没了） | 保住 `fn`，只改结算 |

B 接住的是更常见的单点声明；D 接住的是更少见的「只改结算」。用户视角的那句话，在单点上 B 已经够。

### 2. 为何当初 `when` 必填（不是怕 inherit 这个词）

同一提交引入了按 event 整条替换，并写明 **不按字段合并 `when` / `confirmed`**。当时 `confirmed` 甚至还是预留字段（bind 不读）。实现上选了**最简单的做法先糊上去**：按 event 整份替换，没有把「替换语义」和「覆盖语义」分开分析（见顾虑 §7）。

逼每一层提到某事件时都交**完整策略**，是为了：

- 对象形主字段是 `when`，只写 `confirmed` 既关不了层，又看起来像补丁
- **局部可读**：打开最高层写了该事件的那份 `closeOn`，就能读出关不关、算不算确认，不必回到 define / use / clone 去拼
- 避免 `define: { confirmed: true }` + `use: { when: fn }` + `clone: { confirmed: false }` 造成「closeOn 按属性合并」的错觉

「都写了」换到的是可读性；代价是确认路径也要把 `when` 再写一遍。

### 3. 行为清晰 vs 少打字（层级多时）

merge 链很长。若允许按字段拼，每一层都可以只写一半，最终行为要沿链还原。整条替换啰嗦，但任意一层提到 `success`，那一层就是快照。

这否决的是 **D**，不是 B：

- **A / B**：提到该事件的最高层是完整快照（B 只是允许快照里 `when` 缺省为 `always`）
- **D**：最高层 `{ confirmed: true }` **读不出** `when`，必须向下追

仓库里 `closeOn` 几乎都写在一层；`when: fn` 少；「下层 `fn` + 上层只改 `confirmed`」更少。D 优化最稀有的路径，却会教会一种拆字段的写法——层级越多越亏。

看错的严重程度：

- **A**：`{ confirmed: true }` 无效（warn）。痛在「怎么不关」，不会关错层。
- **B**：局部正确（always + 确认）。若本意是保住 `fn`，会无条件关——意图错了，不是读不出行为。逃逸口：显式 `{ when: fn, confirmed: true }`。
- **D**：两层单独看都像完整的，叠起来才是真行为。

清晰度：**A ≈ B ≫ D**。

### 4. inherit 的解释成本（刻意后置）

inherit 要对齐「只标确认」的覆盖意图，实现上还要讲清：

- 只继承**正在生效的非 `none` 的 `when`**（`always` 或 `fn`）；键已被 tombstone 掉 = 没有，用 `always`
- 不透过 `none` 捡更早的 `fn`（`fn → false → { confirmed: true }` 的结果是 always + 确认，B 与 D 在这条上相同）
- `true` / `'always'` 仍是整条 always，否则盖不掉 `fn`
- 缺 `when` 必须在 **merge 期**当指令，不能在 normalize 里先拍成 `always`（否则还没看到下层）
- merge 之后不得留下 inherit 哨兵

文档要解释「省略 `when` ≠ 显式 `when: 'always'`」（D 下两者不同；B 下相同）。对使用者来说，这和「`{ confirmed: true }` 就是无条件确认」相比，成本高一截。

反向例子也会难讲：调用侧先写了 `{ confirmed: true }`，内容里再加 `when: fn`——merge 上 define 低于 use。B 下内容的 `fn` **无效**（use 已是 always 快照）；D 下 `fn` 会改变关层条件、但保住确认。两种「意外」都要写进指南。更高层只写 `{ when: fn }` 仍会把下层 `confirmed: true` 打回 `false`（现有整条替换）；若再给 `confirmed` 做 inherit，才是真正的按属性合并。

**因此 inherit 等有人反馈「我想只改 confirmed、保住 when: fn」再做。** 在那之前不把 D 的心智模型教出去。

### 5. 空对象 `{}`

若 `when` 可省（默认 always）、`confirmed` 本来就可省（默认 false），对称上 `success: {}` 会变成 always + 非确认，与 `true` / `['success']` 同义。

这很糟：能跑，但读不出意图，对象形从「写策略」变成可空袋子。

倾向 B 时必须加：**对象至少写出 `when` 或 `confirmed` 之一**，`{}` 仍非法。不允许「两维都能空」把糖推到空对象。

### 6. 对现有功能的影响（B）

合法写法（数组糖、`true` / `false`、`fn`、带 `when` 的对象、`close({ confirmed: true })`）行为不变。只让现在非法的 `{ confirmed: true }` 开始生效。类型上 `when?` 是加宽。拾起时属 minor 级糖，不是 breaking。空对象 `{}` 以 **normalize 拒绝** 为准；若要类型上也挡，单靠 `when?` + `confirmed?` 不够，需联合类型。

### 7. 替换语义 vs 覆盖语义（本轮不改的核心）

缺 `when` 的对象其实有两种完全不同的读法，当时没有拆开就落地了整条替换：

| | **替换**（现状 / 倾向 B） | **覆盖**（inherit / D） |
|--|--|--|
| 这一层写 `{ confirmed: false }` | 整份策略换成 `always + false` | 只改结算，`when` 沿用下层 |
| 看一层能不能回答 `$confirm` 的 `when` | 能（缺省就是 always） | 不能，要沿 define → use → clone 拼 |
| 作者只拨 `confirmed` 时 | `when: fn` 会被丢掉 | `fn` 还在 |

**会写出「下层写满、上层只拨 confirmed」的人，多半当覆盖用；always / 整条替换迎合的不是这种写法，而是「一层配置必须是完整快照」。** 没有一种能同时当「用户预期」。选 B 等于规定：这种链不是目标 API；要保住 `fn` 又改结算，必须写全 `{ when: fn, confirmed: false }`。

#### 多层只拨 confirmed：`$confirm` 的 when 是什么

```text
define: { when: fn, confirmed: true }  →  fn + true
use:    { confirmed: false }
clone:  { confirmed: true }
```

覆盖（inherit）：

```text
use    →  fn + false    // 沿用 fn
clone  →  fn + true     // when 仍是 define 的 fn
```

`$confirm()` 的 `when` 还是 **define 的 `fn`**。clone 只把结算拨回确认。`use` 把确认关掉、`clone` 再打开，`when` 全程埋在最底层。三份配置单独看都无法回答行为。

替换（B）：

```text
use    →  always + false   // fn 没了
clone  →  always + true
```

`$confirm()` 的 `when` 是 **always**。看见 clone 那一层就是完整答案。代价是 define 的 `fn` 在 use 只写 `confirmed` 时被丢掉。

第一行若误写成「define `{ when: fn, confirmed: true }` → `fn + false`」是错的：define 已经写了 `confirmed: true`，这一层就是 `fn + true`；后面才是只改结算。

#### `{ confirmed: false }` 往往不是关掉整个 `$confirm`

更常见的是：**多种事件都能触发 confirm，调用方要关掉其中某几条的确认路径**，不是「这份实例不用 `$confirm`」。

```ts
// define：两条都能关，且都可以当确认
closeOn: {
  success: { when: fn, confirmed: true },
  select: { when: 'always', confirmed: true },
}

// use：只想 $confirm 在 success 时拿到结果；select 只关层、走 reject
closeOn: {
  select: { confirmed: false },
}
```

没写的事件（`success`）：A / B / D 都保留（按 event patch）。  
写了 `{ confirmed: false }` 的 `select`：覆盖只拔确认、保住 `when`；替换会连 `when` 重置成 `always`。若 define 里 `select` 是 `fn`，关层条件也被改掉——和「只关其中某些 confirm」拧着。

clone 再把 `select` 拨回 `{ confirmed: true }` 时：覆盖下 `when` 一直跟着 define；替换下 `select` 在 use 就已经变成 always。

#### 为何仍不改实现

替换糊上去成本低、局部可读；覆盖更贴「按事件拨确认」和「define 写满、use/clone 只拨 confirmed」，但要把「what when」变成跨层追问，多层 inherit 是最硬的反例。两种语义都成立，当时没做这场分析。**在有真实反馈之前，不把覆盖教出去，也不改现网 merge。**

---

## 工作例子（B vs D，供拾起时对照）

**单点** `{ confirmed: true }`：A 忽略；B / D → always + 确认。

**下层 `fn`，上层 `{ confirmed: true }`**：A 上层忽略；B → always + 确认（条件没了）；D → `fn` + 确认。这是 B/D 唯一重要分叉。

**`fn → false → { confirmed: true }`**：tombstone 删键后再写是重新声明。B / D 都是 always + 确认；A 第三步忽略。不要让 D 透过 `none` 看见更早的 `fn`。

**define `fn + true`，use / clone 只拨 confirmed**：见顾虑 §7。覆盖下 `$confirm` 的 `when` 仍是 `fn`；替换下从 use 起就是 `always`。作者预期更像覆盖；产品预期（一层快照）更像替换。

---

## 决策

1. **暂不改实现**（本轮 Deferred）。按 event 整条替换是当时最简单的糊法，没有把替换语义和覆盖语义拆开；在有反馈之前维持现状（`when` 必填，`{ confirmed: true }` 仍忽略）。
2. **拾起糖时倾向 B**（替换）：`{ confirmed: true }` ≡ `{ when: 'always', confirmed: true }`；合并仍整条替换。不是因为用户在 §7 的链上会猜 always，而是不鼓励、也不解释那种只拨 `confirmed` 的链。
3. **`success: {}` 保持无效**。
4. **不取 C**（`'confirmed'` 字符串）。
5. **不取 D（覆盖 / inherit）**，除非日后有真实反馈需要「只改结算、保住 `when: fn`」或「按事件关掉部分 confirm 路径」。
6. 拾起 B 时改：`CloseOnPolicyObjectRaw`（`when?`，但对象不得为空——运行时拒绝 `{}`，类型上需联合类型才挡得住）、`normalizeCloseOn`、相关测试、指南与 README「等待弹层结果」示例。

---

## 后果（现状 / 拾起后）

- **现在**：文档继续用完整对象 `{ when: 'always', confirmed: true }`。首页不必专门解释「缺 `when` 会被忽略」（例子本身合法即可）。
- **拾起 B 后**：README 可用 `{ confirmed: true }`；注明这是完整条目（always + 确认），不是字段覆盖、也不会 inherit 下层 `fn`。要保住条件关或按事件关掉部分 confirm，须把 `when` 写全。
