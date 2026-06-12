<script setup lang="ts">
import { ElTag } from 'element-plus'

defineProps<{
  id: string
  title: string
  description: string
  tags: string[]
}>()
</script>

<template>
  <section :id="id" class="demo-section">
    <header class="demo-section__meta">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <div class="demo-section__tags">
        <ElTag v-for="tag in tags" :key="tag" size="small" type="info" effect="plain">
          {{ tag }}
        </ElTag>
      </div>
    </header>
    <div class="demo-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.demo-section {
  scroll-margin-top: 24px;
}

.demo-section__meta {
  margin-bottom: 16px;
}

.demo-section__meta h2 {
  margin: 0 0 6px;
  font-size: 1.125rem;
}

.demo-section__meta p {
  margin: 0 0 10px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.demo-section__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.demo-section__body {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}
</style>
