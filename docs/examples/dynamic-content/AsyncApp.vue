<script setup lang="ts">
import { ref, type Component } from 'vue'
import { ElButton } from 'element-plus'
import { useDialog } from '../shared/layers'

const loading = ref(false)
const layer = useDialog()

/** 模拟慢网络：约 3s 后再 resolve 模块 */
function loadHeavyForm() {
  return new Promise<Component>((resolve, reject) => {
    window.setTimeout(() => {
      import('./HeavyForm.vue')
        .then((m) => resolve(m.default))
        .catch(reject)
    }, 3000)
  })
}

async function openHeavy() {
  if (loading.value) return
  loading.value = true
  try {
    const component = await loadHeavyForm()
    layer.open({ component })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="async-demo">
    <p class="hint">
      点击后先加载异步内容（约 3 秒），按钮进入加载中；加载完成再
      <code>open</code>。
    </p>
    <ElButton type="primary" :loading="loading" @click="openHeavy">
      {{ loading ? '组件加载中…' : '打开异步内容' }}
    </ElButton>
  </div>
</template>

<style scoped>
.async-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.hint {
  flex: 1 1 100%;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--vp-c-bg-soft);
  font-size: 12px;
}
</style>
