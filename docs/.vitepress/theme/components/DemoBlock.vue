<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
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
  }>(),
  {
    files: () => [],
    expand: false,
  },
)

const visible = ref(props.expand)
const copied = ref(false)

const displayFiles = computed<DemoFile[]>(() => {
  if (props.files.length) return props.files
  if (props.source) return [{ name: 'App.vue', code: props.source }]
  return []
})

async function copyCode() {
  const text = displayFiles.value.map((f) => `// ${f.name}\n${f.code}`).join('\n\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
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

    <div class="demo-block__actions">
      <button type="button" class="demo-block__btn" @click="visible = !visible">
        {{ visible ? '隐藏源码' : '展开源码' }}
      </button>
      <button
        v-if="displayFiles.length"
        type="button"
        class="demo-block__btn"
        @click="copyCode"
      >
        {{ copied ? '已复制' : '复制代码' }}
      </button>
    </div>

    <Transition name="demo-source">
      <div v-show="visible" class="demo-block__source">
        <div
          v-for="file in displayFiles"
          :key="file.name"
          class="demo-block__file"
        >
          <div class="demo-block__file-name">{{ file.name }}</div>
          <div class="language-vue vp-adaptive-theme">
            <button
              type="button"
              class="demo-block__collapse"
              title="隐藏源码"
              @click="visible = false"
            />
            <pre><code class="language-vue">{{ file.code }}</code></pre>
          </div>
        </div>
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

.demo-block__file + .demo-block__file {
  border-top: 1px solid var(--vp-c-divider);
}

.demo-block__file-name {
  padding: 8px 16px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.demo-block__file :deep(pre) {
  margin: 0;
  padding: 12px 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.demo-block__file :deep(code) {
  font-family: var(--vp-font-family-mono);
}

.demo-block__collapse {
  position: absolute;
  right: 12px;
  top: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  opacity: 0.7;
}

.demo-block__collapse::before,
.demo-block__collapse::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 2px;
  background: var(--vp-c-text-2);
  transform: translate(-50%, -50%);
}

.demo-block__file .language-vue {
  position: relative;
}

.demo-source-enter-active,
.demo-source-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
}

.demo-source-enter-from,
.demo-source-leave-to {
  opacity: 0;
}
</style>
