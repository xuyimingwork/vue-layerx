<script setup lang="ts">
import { ElButton, ElDialog } from 'element-plus'
import { createLayer } from 'vue-layerx'
import HelloContent from './HelloContent.vue'

const useLayer = createLayer(ElDialog)
const dialog = useLayer(HelloContent)
</script>

<template>
  <pre class="snippet"><code>const useLayer = createLayer(ElDialog)
const dialog = useLayer(HelloContent)
dialog.open()</code></pre>

  <ElButton type="primary" @click="dialog.open()">dialog.open()</ElButton>
</template>

<style scoped>
.snippet {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.snippet code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
