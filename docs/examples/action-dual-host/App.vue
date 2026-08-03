<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../shared/layers'
import NotePanel from './NotePanel.vue'

const dialog = useDialog(NotePanel)

function onPreview(text: string) {
  ElMessage.info(`预览：${text.slice(0, 24)}${text.length > 24 ? '…' : ''}`)
}

function onSave(text: string) {
  ElMessage.success(`已保存：${text.slice(0, 24)}${text.length > 24 ? '…' : ''}`)
}

function openLayer() {
  dialog.open({
    props: {
      title: '弹层编辑',
      onPreview,
      onSave,
    },
  })
}
</script>

<template>
  <section class="block">
    <p class="label">同一 NotePanel · 页内嵌入</p>
    <NotePanel title="页内编辑" @preview="onPreview" @save="onSave" />
  </section>

  <ElButton type="primary" @click="openLayer">弹层打开同一内容</ElButton>
</template>

<style scoped>
.block {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
</style>
