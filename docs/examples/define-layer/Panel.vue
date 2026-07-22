<script setup lang="ts">
import { defineLayer } from 'vue-layerx'

const layer = defineLayer({
  props: { title: '内容里声明的标题', width: '420px' },
})
</script>

<template>
  <div class="panel">
    <p>内容组件：普通的 Vue 组件</p>
    <p class="mode">当前：{{ layer.exists ? '弹层中使用' : '普通使用' }}</p>
  </div>
</template>

<style scoped>
.panel {
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.panel p {
  margin: 0;
}

.mode {
  margin-top: 8px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
</style>
