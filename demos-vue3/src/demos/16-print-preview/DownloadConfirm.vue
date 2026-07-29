<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElRadio, ElRadioGroup } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

export type DownloadFormat = 'pdf' | 'png'

const emit = defineEmits<{
  confirm: [payload: { format: DownloadFormat }]
}>()

const format = ref<DownloadFormat>('pdf')

const layer = defineLayer({
  props: { title: '选择下载格式', width: '360px' },
  content: {
    closeOn: {
      confirm: { when: 'always', confirmed: true },
    },
  },
})
</script>

<template>
  <p class="hint">取消用 MyDialog 自带的「关闭」；此处 actions 只放确认。</p>

  <ElRadioGroup v-model="format" class="formats">
    <ElRadio value="pdf">PDF</ElRadio>
    <ElRadio value="png">PNG</ElRadio>
  </ElRadioGroup>

  <LayerTemplate :to="layer" name="actions">
    <ElButton type="primary" @click="emit('confirm', { format })">
      确认下载
    </ElButton>
  </LayerTemplate>
</template>

<style scoped>
.hint {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.formats {
  display: flex;
  gap: 16px;
}
</style>
