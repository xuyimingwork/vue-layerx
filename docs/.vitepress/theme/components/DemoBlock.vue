<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import type { Component } from 'vue'
import { codeToHtml } from 'shiki'
import ClientOnly from './ClientOnly.vue'

export interface DemoFile {
  name: string
  code: string
}

const props = withDefaults(
  defineProps<{
    demo: Component
    files?: DemoFile[]
    source?: string
    title?: string
    expand?: boolean
    /** 只展示可交互预览，不提供展开源码 */
    previewOnly?: boolean
  }>(),
  {
    files: () => [],
    expand: false,
    previewOnly: false,
  },
)

const visible = ref(props.expand)
const activeIndex = ref(0)
const highlightedHtml = ref('')

const displayFiles = computed<DemoFile[]>(() => {
  if (props.files.length) return props.files
  if (props.source) return [{ name: 'App.vue', code: props.source }]
  return []
})

const activeFile = computed(() => displayFiles.value[activeIndex.value])

function langOf(name: string) {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript'
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript'
  if (name.endsWith('.css')) return 'css'
  if (name.endsWith('.json')) return 'json'
  return 'vue'
}

watch(displayFiles, (files) => {
  if (activeIndex.value >= files.length) activeIndex.value = 0
})

watchEffect(async () => {
  const file = activeFile.value
  if (!file) {
    highlightedHtml.value = ''
    return
  }
  const lang = langOf(file.name)
  try {
    highlightedHtml.value = await codeToHtml(file.code, {
      lang,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
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
  <div class="demo-block">
    <p v-if="title" class="demo-block__title">{{ title }}</p>

    <div class="demo-block__preview">
      <ClientOnly>
        <component :is="demo" />
        <template #fallback>
          <div class="demo-block__loading">加载示例中…</div>
        </template>
      </ClientOnly>
    </div>

    <div v-if="!previewOnly && displayFiles.length" class="demo-block__actions">
      <button type="button" class="demo-block__btn" @click="visible = !visible">
        {{ visible ? '隐藏源码' : '展开源码' }}
      </button>
    </div>

    <Transition v-if="!previewOnly" name="demo-source">
      <div v-show="visible" class="demo-block__source">
        <div v-if="displayFiles.length > 1" class="demo-block__tabs" role="tablist">
          <button
            v-for="(file, index) in displayFiles"
            :key="file.name"
            type="button"
            role="tab"
            class="demo-block__tab"
            :class="{ 'demo-block__tab--active': index === activeIndex }"
            :aria-selected="index === activeIndex"
            @click="activeIndex = index"
          >
            {{ file.name }}
          </button>
        </div>
        <div v-else-if="activeFile" class="demo-block__file-name">
          {{ activeFile.name }}
        </div>

        <div
          v-if="highlightedHtml"
          class="demo-block__code vp-code"
          v-html="highlightedHtml"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.demo-block {
  margin: 16px 0 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.demo-block__title {
  margin: 0;
  padding: 12px 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.demo-block__preview {
  padding: 20px 16px;
}

.demo-block__loading {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.demo-block__actions {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 12px;
}

.demo-block__btn {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.demo-block__btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.demo-block__source {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-code-block-bg);
}

.demo-block__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  padding: 0 8px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  overflow-x: auto;
}

.demo-block__tab {
  flex-shrink: 0;
  margin: 0;
  padding: 10px 14px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.demo-block__tab:hover {
  color: var(--vp-c-brand-1);
}

.demo-block__tab--active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.demo-block__file-name {
  padding: 8px 16px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-block__code {
  overflow-x: auto;
}

.demo-block__code :deep(pre) {
  margin: 0;
  padding: 12px 16px;
  background: transparent !important;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.demo-block__code :deep(code) {
  font-family: var(--vp-font-family-mono);
  background: transparent !important;
  padding: 0;
  font-size: inherit;
}

.demo-block__code :deep(.shiki),
.demo-block__code :deep(.shiki span) {
  background: transparent !important;
}

/* shiki dual theme via CSS variables (defaultColor: false) */
.demo-block__code :deep(.shiki span) {
  color: var(--shiki-light);
}

:root.dark .demo-block__code :deep(.shiki span),
.dark .demo-block__code :deep(.shiki span) {
  color: var(--shiki-dark);
}

.demo-source-enter-active,
.demo-source-leave-active {
  transition: opacity 0.2s ease;
}

.demo-source-enter-from,
.demo-source-leave-to {
  opacity: 0;
}
</style>
