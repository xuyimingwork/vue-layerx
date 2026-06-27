<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  close: []
}>()

const layer = defineLayer({
  props: { title: '你好，vue-layerx' },
  content: { closeOn: ['close'] },
})
</script>

<template>
  <p class="message">调用方三行即可；标题与 closeOn 由 content 内 defineLayer 声明。</p>

  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="emit('close')">关闭</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.message code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}
</style>
