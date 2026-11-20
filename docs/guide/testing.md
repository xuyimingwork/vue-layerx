<script setup>
import stats from '../data/test-stats.json'

const pct = (n) => (typeof n === 'number' ? `${n}%` : '—')
const generatedLabel = stats.generatedAt
  ? new Date(stats.generatedAt).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC')
  : null
</script>

# 测试与覆盖率

发布与 CI 会跑完整测试门禁；本页数字在 **文档站构建时重新实测**（`pnpm docs:stats`），与 `prepublishOnly` 口径一致：单元 + Vue 3 集成 + Vue 2.7 集成。

<p v-if="stats.placeholder" class="stats-placeholder">
  本地若尚未跑过 <code>pnpm docs:stats</code>，这里是占位数据。正式站点由
  <a href="https://github.com/xuyimingwork/vue-layerx/actions/workflows/deploy-pages.yml">Deploy Pages</a>
  构建时写入实测结果。
</p>

## 用例数

| 套件 | 用例数 |
|------|--------:|
| 单元（含类型测试） | {{ stats.suites.unit }} |
| Vue 3 集成（消费 dist） | {{ stats.suites.vue3 }} |
| Vue 2.7 集成（消费 dist） | {{ stats.suites.vue2 }} |
| **合计** | **{{ stats.total }}** |

## 覆盖率

合并单元 + Vue 3 / Vue 2.7 源码归因趟后的 Istanbul 报告：

| 指标 | 覆盖率 |
|------|-------:|
| Lines | {{ pct(stats.coverage.lines) }} |
| Statements | {{ pct(stats.coverage.statements) }} |
| Functions | {{ pct(stats.coverage.functions) }} |
| Branches | {{ pct(stats.coverage.branches) }} |

更细的文件级视图见 [Codecov](https://codecov.io/gh/xuyimingwork/vue-layerx)。

<p v-if="generatedLabel" class="stats-meta">
  数据生成于 {{ generatedLabel }}
</p>

## 怎么跑

```bash
pnpm test:ci          # 与 CI 同门禁
pnpm docs:stats       # 实测并写入本页数据
```

贡献者向的目录约定、分层规则见仓库根目录 [TESTING.md](https://github.com/xuyimingwork/vue-layerx/blob/main/TESTING.md)。

<style scoped>
.stats-placeholder {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.stats-meta {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
</style>
