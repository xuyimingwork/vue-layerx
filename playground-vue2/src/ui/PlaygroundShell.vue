<script setup lang="ts">
import type { DemoGroup } from '../demos/types'

defineProps<{
  groups: DemoGroup[]
}>()
</script>

<template>
  <div class="playground">
    <header class="playground-header">
      <div class="playground-header__inner">
        <h1>vue-layerx · Vue 2.7 Playground</h1>
        <p>
          Element UI 示例。关键差异：Dialog 需
          <code>model: 'visible'</code>（不是默认 <code>value</code>）。
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
            </div>
          </article>
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
  border-bottom: 1px solid var(--pg-border);
  background: var(--pg-surface);
}

.playground-header__inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px 24px;
}

.playground-header h1 {
  margin: 0 0 8px;
  font-size: 1.45rem;
}

.playground-header p {
  margin: 0;
  max-width: 720px;
  color: var(--pg-muted);
  font-size: 14px;
  line-height: 1.6;
}

.playground-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  align-items: start;
}

.playground-nav {
  position: sticky;
  top: 16px;
  padding: 12px;
  border: 1px solid var(--pg-border);
  border-radius: 8px;
  background: var(--pg-surface);
}

.playground-nav__group-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
}

.playground-nav__group-sub {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--pg-muted);
}

.playground-nav__link {
  display: block;
  padding: 6px 8px;
  border-radius: 4px;
  color: var(--pg-text);
  text-decoration: none;
  font-size: 13px;
}

.playground-nav__link:hover {
  background: var(--pg-code-bg);
  color: var(--pg-accent);
}

.playground-group__header {
  margin-bottom: 16px;
}

.playground-group__header h2 {
  margin: 0 0 4px;
  font-size: 1.2rem;
}

.playground-group__header p {
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
  .playground-layout {
    grid-template-columns: 1fr;
  }

  .playground-nav {
    position: static;
  }
}
</style>
