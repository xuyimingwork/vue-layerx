<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  done: []
}>()

const layer = defineLayer({
  props: { title: '写备忘', width: '420px' },
  content: { closeOn: ['done'] },
})
</script>

<template>
  <p class="body">备忘表单（示例内容组件 B）</p>
  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="emit('done')">完成</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
