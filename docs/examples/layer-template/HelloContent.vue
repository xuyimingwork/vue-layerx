<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  ok: []
}>()

const layer = defineLayer({
  props: { title: '我的弹层', width: '420px' },
  content: { closeOn: ['ok'] },
})
</script>

<template>
  <p class="body">正文在默认插槽；确定按钮经 <code>LayerTemplate</code> 投到容器的 <code>#footer</code>。</p>

  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="emit('ok')">确定</ElButton>
  </LayerTemplate>
</template>

<style scoped>
.body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.body code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}
</style>
