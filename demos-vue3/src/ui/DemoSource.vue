<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { codeToHtml } from 'shiki'
import type { DemoFile } from '../demos/types'

const props = defineProps<{
  files: DemoFile[]
}>()

const visible = ref(false)
const activeIndex = ref(0)
const highlightedHtml = ref('')

const activeFile = computed(() => props.files[activeIndex.value])

function langOf(name: string) {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript'
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript'
  if (name.endsWith('.css')) return 'css'
  if (name.endsWith('.json')) return 'json'
  return 'vue'
}

watch(
  () => props.files,
  (files) => {
    if (activeIndex.value >= files.length) activeIndex.value = 0
  },
)

watchEffect(async () => {
  const file = activeFile.value
  if (!file || !visible.value) {
    if (!file) highlightedHtml.value = ''
    return
  }
  const lang = langOf(file.name)
  try {
    highlightedHtml.value = await codeToHtml(file.code, {
      lang,
      theme: 'github-light',
    })
  } catch {
    highlightedHtml.value = `<pre><code>${escapeHtml(file.code)}</code></pre>`
  }
})

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
</script>

<template>
  <div v-if="files.length" class="demo-source">
    <div class="demo-source__actions">
      <button type="button" class="demo-source__btn" @click="visible = !visible">
        {{ visible ? '隐藏源码' : '展开源码' }}
      </button>
    </div>

    <div v-show="visible" class="demo-source__panel">
      <div v-if="files.length > 1" class="demo-source__tabs" role="tablist">
        <button
          v-for="(file, index) in files"
          :key="file.name"
          type="button"
          role="tab"
          class="demo-source__tab"
          :class="{ 'demo-source__tab--active': index === activeIndex }"
          :aria-selected="index === activeIndex"
          @click="activeIndex = index"
        >
          {{ file.name }}
        </button>
      </div>
      <div v-else-if="activeFile" class="demo-source__file-name">
        {{ activeFile.name }}
      </div>

      <div
        v-if="highlightedHtml"
        class="demo-source__code"
        v-html="highlightedHtml"
      />
    </div>
  </div>
</template>

<style scoped>
.demo-source__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter, #e4e7ed);
}

.demo-source__btn {
  padding: 4px 12px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--el-fill-color-blank, #fff);
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.demo-source__btn:hover {
  color: var(--el-color-primary, #409eff);
  border-color: var(--el-color-primary, #409eff);
}

.demo-source__panel {
  margin-top: 12px;
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 6px;
  overflow: hidden;
  background: #f6f8fa;
}

.demo-source__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  padding: 0 8px;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
  overflow-x: auto;
}

.demo-source__tab {
  flex-shrink: 0;
  margin: 0;
  padding: 10px 14px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--el-text-color-secondary, #909399);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.4;
  cursor: pointer;
}

.demo-source__tab:hover {
  color: var(--el-color-primary, #409eff);
}

.demo-source__tab--active {
  color: var(--el-color-primary, #409eff);
  border-bottom-color: var(--el-color-primary, #409eff);
}

.demo-source__file-name {
  padding: 8px 16px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--el-text-color-secondary, #909399);
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
}

.demo-source__code {
  overflow-x: auto;
}

.demo-source__code :deep(pre) {
  margin: 0;
  padding: 12px 16px;
  background: transparent !important;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.demo-source__code :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: transparent !important;
  padding: 0;
  font-size: inherit;
}

.demo-source__code :deep(.shiki),
.demo-source__code :deep(.shiki span) {
  background: transparent !important;
}
</style>
