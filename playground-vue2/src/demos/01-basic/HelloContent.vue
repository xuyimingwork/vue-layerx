<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const layer = defineLayer({
  props: { title: '你好，vue-layerx · Vue 2.7' },
  content: { closeOn: ['close'] },
})
</script>

<template>
  <div>
    <p class="message">
      Element UI Dialog 需显式 <code>model: 'visible'</code>；footer 由
      <code>LayerTemplate</code> 投递。
    </p>

    <LayerTemplate :to="layer" name="footer">
      <el-button type="primary" @click="emit('close')">关闭</el-button>
    </LayerTemplate>
  </div>
</template>

<style scoped>
.message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pg-muted);
}
</style>
