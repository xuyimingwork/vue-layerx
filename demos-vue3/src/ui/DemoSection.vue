<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'
import { useReload } from 'vue-reload'
import { ElTag } from 'element-plus'
import DemoSource from './DemoSource.vue'
import type { DemoFile } from '../demos/types'

defineProps<{
  id: string
  level: number
  title: string
  description: string
  tags: string[]
  files: DemoFile[]
}>()

/** Real root so remount tears down slot content (transparent return of slots would not). */
const DemoReloadHost = defineComponent({
  name: 'DemoReloadHost',
  setup(_, { slots }) {
    return () => h('div', { class: 'demo-reload-host' }, slots.default?.())
  },
})

const panelRef = ref<InstanceType<typeof DemoReloadHost>>()
const reloadPanel = useReload(panelRef)
</script>

<template>
  <section :id="id" class="demo-section">
    <header class="demo-section__meta">
      <div class="demo-section__heading">
        <span class="demo-section__level">Lv.{{ level }}</span>
        <h2>{{ title }}</h2>
      </div>
      <p>{{ description }}</p>
      <div class="demo-section__tags">
        <ElTag v-for="tag in tags" :key="tag" size="small" type="info" effect="plain">
          {{ tag }}
        </ElTag>
      </div>
    </header>
    <div class="demo-section__body">
      <DemoReloadHost ref="panelRef">
        <slot />
      </DemoReloadHost>
      <DemoSource :files="files">
        <template #actions-end>
          <button
            type="button"
            title="重新挂载本 demo，清理由其创建的 layer 实例"
            @click="reloadPanel()"
          >
            刷新
          </button>
        </template>
      </DemoSource>
    </div>
  </section>
</template>

<style scoped>
.demo-section {
  scroll-margin-top: 24px;
}

.demo-section__heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.demo-section__level {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.demo-section__meta h2 {
  margin: 0;
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
