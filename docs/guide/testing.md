<script setup>
import stats from '../data/test-stats.json'

const pct = (n) => (typeof n === 'number' ? `${n}%` : '—')
const cell = (n) => (typeof n === 'number' ? n : '—')
const tierTotal = (tier) => (tier?.runtime ?? 0) + (tier?.types ?? 0)
const colSum = (key) =>
  (stats.suites.unit?.[key] ?? 0) +
  (stats.suites.vue3?.[key] ?? 0) +
  (stats.suites.vue2?.[key] ?? 0)
const loc = (n) => (typeof n === 'number' && n > 0 ? n.toLocaleString('en-US') : '—')
const ratio = (n) => (typeof n === 'number' && n > 0 ? String(n) : '—')

const generatedLabel = stats.generatedAt
  ? new Date(stats.generatedAt).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC')
  : null
</script>

# 测试与覆盖率

<p class="badge-row">
  <a href="https://github.com/xuyimingwork/vue-layerx/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/xuyimingwork/vue-layerx/ci.yml?branch=main&label=ci" alt="ci" />
  </a>
  <a href="https://codecov.io/gh/xuyimingwork/vue-layerx">
    <img src="https://codecov.io/gh/xuyimingwork/vue-layerx/graph/badge.svg" alt="codecov" />
  </a>
</p>

vue-layerx 通过不同层级合计 **{{ stats.total }}** 个测试用例，保障源码测试覆盖率达到 **{{ pct(stats.coverage.lines) }}**。

> 源码有效代码 {{ loc(stats.loc?.source) }} 行，测试有效代码 {{ loc(stats.loc?.test) }} 行，测试与源码比达到 {{ ratio(stats.loc?.testPerSource) }}:1，远超常规开源项目 1:1 ~ 1.5:1 的平均水平，确保项目的高可靠性。

每个版本发布、每一次 CI，都会完整跑一遍测试流水线：

1. **单元测试**——对着源码测内部模块（含类型测试）。
2. **集成测试**——先 `build` 出产物（`dist`），再以 Vue 3、Vue 2.7 各自的**独立项目**模拟真实用户，只通过公开 API 消费该产物（含类型测试）。

本页数字在文档站构建时重新实测（`pnpm docs:stats`）：用例数与覆盖率口径与发布前的 `prepublishOnly` 一致；源码 / 测试行数为 SLOC（去掉空行与注释后的有效行；`src` 库代码 vs `src/**/__test__` + `tests*`）。

<p v-if="stats.placeholder" class="stats-placeholder">
  本地若尚未跑过 <code>pnpm docs:stats</code>，这里是占位数据。正式站点由
  <a href="https://github.com/xuyimingwork/vue-layerx/actions/workflows/deploy-pages.yml">Deploy Pages</a>
  构建时写入实测结果。
</p>

## 用例数

按「测什么」×「怎么测」拆开：行为用例验证实际表现，类型用例锁住 TypeScript 推导。

| 层级 | 行为 | 类型 | 小计 |
|------|-------:|-----:|-----:|
| 单元（源码） | {{ cell(stats.suites.unit.runtime) }} | {{ cell(stats.suites.unit.types) }} | {{ tierTotal(stats.suites.unit) }} |
| Vue 3 集成（产物） | {{ cell(stats.suites.vue3.runtime) }} | {{ cell(stats.suites.vue3.types) }} | {{ tierTotal(stats.suites.vue3) }} |
| Vue 2.7 集成（产物，关键路径） | {{ cell(stats.suites.vue2.runtime) }} | {{ cell(stats.suites.vue2.types) }} | {{ tierTotal(stats.suites.vue2) }} |
| **合计** | **{{ colSum('runtime') }}** | **{{ colSum('types') }}** | **{{ stats.total }}** |

## 覆盖率

合并后的源码覆盖率（上报 [Codecov](https://codecov.io/gh/xuyimingwork/vue-layerx)）：

| 指标 | 覆盖率 |
|------|-------:|
| Lines | {{ pct(stats.coverage.lines) }} |
| Statements | {{ pct(stats.coverage.statements) }} |
| Functions | {{ pct(stats.coverage.functions) }} |
| Branches | {{ pct(stats.coverage.branches) }} |

文件级覆盖率明细见 [Codecov](https://codecov.io/gh/xuyimingwork/vue-layerx)。

## 本地怎么跑

```bash
pnpm test:ci          # 与 CI 同流水线（类型检查 + 集成 + 合并覆盖率）
pnpm docs:stats       # 实测并刷新本页数据
```

贡献者向的目录约定、分层规则见仓库根目录 [TESTING.md](https://github.com/xuyimingwork/vue-layerx/blob/main/TESTING.md)。

<p v-if="generatedLabel" class="stats-meta">
  本页数据生成于 {{ generatedLabel }}
</p>

<style scoped>
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 0.5rem 0 1.25rem;
}
.badge-row img {
  display: block;
}
.stats-placeholder {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.stats-meta {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
</style>
