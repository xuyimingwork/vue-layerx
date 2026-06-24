<script setup lang="ts">
import type { DemoGroup } from '../demos/types'
import DemoSection from './DemoSection.vue'

defineProps<{
  groups: DemoGroup[]
}>()
</script>

<template>
  <div class="playground">
    <header class="playground-header">
      <div class="playground-header__inner">
        <h1>vue-layerx Playground</h1>
        <p>
          由易到难逐级演示：先 <code>open()</code> 打开弹层，再接触插槽、换层、
          配置合并与生命周期。示例按 <strong>Lv.1 → Lv.8</strong> 排列。
        </p>
      </div>
    </header>

    <div class="playground-layout">
      <nav class="playground-nav">
        <div v-for="group in groups" :key="group.id" class="playground-nav__group">
          <p class="playground-nav__group-title">{{ group.title }}</p>
          <p class="playground-nav__group-sub">{{ group.subtitle }}</p>
          <a
            v-for="item in group.items"
            :key="item.id"
            :href="`#${item.id}`"
            class="playground-nav__link"
          >
            <span class="playground-nav__level">Lv.{{ item.level }}</span>
            {{ item.title }}
          </a>
        </div>
      </nav>

      <main class="playground-main">
        <section
          v-for="group in groups"
          :key="group.id"
          class="playground-group"
        >
          <header class="playground-group__header">
            <h2>{{ group.title }}</h2>
            <p>{{ group.subtitle }}</p>
          </header>

          <DemoSection
            v-for="item in group.items"
            :id="item.id"
            :key="item.id"
            :level="item.level"
            :title="item.title"
            :description="item.description"
            :tags="item.tags"
          >
            <component :is="item.component" />
          </DemoSection>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.playground {
  min-height: 100vh;
}

.playground-header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.playground-header__inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 24px;
}

.playground-header h1 {
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.playground-header p {
  margin: 0;
  max-width: 720px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.playground-header code {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  font-size: 13px;
}

.playground-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.playground-nav {
  position: sticky;
  top: 24px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.playground-nav__group-title {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.playground-nav__group-sub {
  margin: 0 0 6px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
}

.playground-nav__link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  text-decoration: none;
  transition: background 0.15s;
}

.playground-nav__level {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.playground-nav__link:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.playground-main {
  display: flex;
  flex-direction: column;
  gap: 48px;
  min-width: 0;
}

.playground-group__header {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.playground-group__header h2 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.playground-group__header p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.playground-group {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

@media (max-width: 720px) {
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .playground-nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .playground-nav__group {
    flex: 1 1 140px;
  }
}
</style>
