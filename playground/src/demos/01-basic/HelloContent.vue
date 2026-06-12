<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { LayerSlot } from 'vue-layerx'
import { useDialog } from '../../core/layers'

const emit = defineEmits<{
  close: []
}>()

const footerRef = ref()

useDialog.layer({
  props: { title: '你好，vue-layerx' },
  slots: { footer: footerRef },
})
</script>

<template>
  <p class="message">最简用法：content 声明 layer 配置，调用方 <code>show()</code> 即可打开。</p>

  <LayerSlot ref="footerRef">
    <ElButton type="primary" @click="emit('close')">关闭</ElButton>
  </LayerSlot>
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
