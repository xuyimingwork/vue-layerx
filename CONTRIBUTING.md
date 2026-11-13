# 贡献指南

简体中文 | [English](./CONTRIBUTING.en.md)

感谢你愿意为 vue-layerx 做贡献！提交前请花几分钟读完本指南。

## Issue

- 先搜索 [已有 Issues](https://github.com/xuyimingwork/vue-layerx/issues) 和 [文档](https://xuyimingwork.github.io/vue-layerx/)。
- Bug 请注明 vue-layerx、Vue、弹窗组件库的版本，并附**最小复现**。可以用 README 顶部的 Playground 改，也可以提供 StackBlitz 或仓库链接。
- 功能建议请先描述使用场景。部分设计是刻意取舍，可先看 [ADR](./docs/adr/README.md)。

## Pull Request

- 从 `main` 切分支，PR 提回 `main`。
- 新功能请先开 Issue 讨论；Bug 修复请在 PR 中注明 `fix #xxx`。
- 新功能或修复都需要附带测试。
- 同一份 `dist` 同时运行在 Vue 2.7 和 Vue 3 上，请确认两端行为一致。分端实现只放在 `src/compat/vue2` 与 `src/compat/vue3`。
- 不引入运行时依赖。
- 改动公开 API 或行为时，同步更新：
  - `README.md` 与 `README.en.md`
  - `docs/`
  - `CHANGELOG.md` 的 `Unreleased` 小节
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)（`feat` / `fix` / `docs` / `refactor` / `test` / `chore` …）。破坏性变更用 `!` 并写 `BREAKING CHANGE:`。`release:` 前缀保留给发版。

## 开发环境

需要 Node.js 20+ 与 pnpm 9：

```bash
pnpm install   # 同时启用 .githooks：提交 README 时自动更新目录
```

项目未配置 ESLint / Prettier，请与周边代码保持一致：2 空格缩进、单引号、无分号。

## 常用脚本

```bash
pnpm test                    # 单元测试 + 类型测试（源码）
pnpm test:types              # 仅类型测试（src/**/__test__/*.test-d.ts）
pnpm typecheck               # 类型检查
pnpm build                   # 构建 dist/
pnpm test:integration        # Vue 3 集成测试（消费 dist，需先 build）
pnpm test:integration:vue2   # Vue 2.7 集成测试（消费 dist，需先 build）
pnpm demos:vue3              # Vue 3 + Element Plus 示例
pnpm demos:vue2              # Vue 2.7 + Element UI 示例
pnpm docs:dev                # 文档站
```

提 PR 前请确保以上测试与 `pnpm readme:toc --check` 通过，它们与 CI 一致。

## 项目结构

```
src/            源码：api / config / runtime / shared / compat / types
tests-vue3/     Vue 3 集成测试
tests-vue2/     Vue 2.7 集成测试
demos-vue3/     Vue 3 示例
demos-vue2/     Vue 2.7 示例
docs/           文档站与 ADR
```

## 测试

- 单元测试写在源码旁的 `src/**/__test__/`。
- 集成测试按公开 API 分文件，**只消费 `dist`**。
- 用例命名使用 `should … when …`。

详见 [TESTING.md](./TESTING.md)；设计背景见 [DESIGN.md](./DESIGN.md)。
