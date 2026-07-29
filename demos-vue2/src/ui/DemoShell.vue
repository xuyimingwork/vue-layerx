<script setup lang="ts">
import type { DemoGroup } from '../demos/types'
import DemoSource from './DemoSource.vue'

defineProps<{
  groups: DemoGroup[]
}>()
</script>

<template>
  <div class="demo-shell">
    <header class="demo-shell-header">
      <div class="demo-shell-header__inner">
        <h1>vue-layerx Demos · Vue 2.7</h1>
        <p>
          Element UI 示例。关键差异：Dialog 需
          <code>model: 'visible'</code>（不是默认 <code>value</code>）。
        </p>
      </div>
    </header>

    <div class="demo-shell-layout">
      <nav class="demo-shell-nav">
        <div v-for="group in groups" :key="group.id" class="demo-shell-nav__group">
          <p class="demo-shell-nav__group-title">{{ group.title }}</p>
          <p class="demo-shell-nav__group-sub">{{ group.subtitle }}</p>
          <a
            v-for="item in group.items"
            :key="item.id"
            :href="`#${item.id}`"
            class="demo-shell-nav__link"
          >
            {{ item.title }}
          </a>
        </div>
      </nav>

      <main class="demo-shell-main">
        <section
          v-for="group in groups"
          :key="group.id"
          class="demo-shell-group"
        >
          <header class="demo-shell-group__header">
            <h2>{{ group.title }}</h2>
            <p>{{ group.subtitle }}</p>
          </header>

          <article
            v-for="item in group.items"
            :id="item.id"
            :key="item.id"
            class="demo-section"
          >
            <header class="demo-section__header">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="demo-section__tags">
                <el-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="mini"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </header>
            <div class="demo-section__body">
              <component :is="item.component" />
              <DemoSource :files="item.files" />
            </div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.demo-shell {
  min-height: 100vh;
}

.demo-shell-header {
  border-bottom: 1px solid var(--pg-border);
  background: var(--pg-surface);
}

.demo-shell-header__inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 24px;
}

.demo-shell-header h1 {
  margin: 0 0 8px;
  font-size: 1.45rem;
}

.demo-shell-header p {
  margin: 0;
  max-width: 720px;
  color: var(--pg-muted);
  font-size: 14px;
  line-height: 1.6;
}

.demo-shell-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  align-items: start;
}

.demo-shell-nav {
  position: sticky;
  top: 16px;
  padding: 12px;
  border: 1px solid var(--pg-border);
  border-radius: 8px;
  background: var(--pg-surface);
}

.demo-shell-nav__group-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
}

.demo-shell-nav__group-sub {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--pg-muted);
}

.demo-shell-nav__link {
  display: block;
  padding: 6px 8px;
  border-radius: 4px;
  color: var(--pg-text);
  text-decoration: none;
  font-size: 13px;
}

.demo-shell-nav__link:hover {
  background: var(--pg-code-bg);
  color: var(--pg-accent);
}

.demo-shell-group__header {
  margin-bottom: 16px;
}

.demo-shell-group__header h2 {
  margin: 0 0 4px;
  font-size: 1.2rem;
}

.demo-shell-group__header p {
  margin: 0;
  color: var(--pg-muted);
  font-size: 13px;
}

.demo-section {
  margin-bottom: 20px;
  border: 1px solid var(--pg-border);
  border-radius: 8px;
  background: var(--pg-surface);
  overflow: hidden;
}

.demo-section__header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--pg-border);
}

.demo-section__header h3 {
  margin: 0 0 6px;
  font-size: 1rem;
}

.demo-section__header p {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--pg-muted);
  line-height: 1.55;
}

.demo-section__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.demo-section__body {
  padding: 18px;
}

@media (max-width: 800px) {
  .demo-shell-layout {
    grid-template-columns: 1fr;
  }

  .demo-shell-nav {
    position: static;
  }
}
</style>
