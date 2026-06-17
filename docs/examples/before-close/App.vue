<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import DraftContent from './DraftContent.vue'

const savedDraft = ref('欢迎使用 vue-layerx')

const draftDialog = useDialog(DraftContent, {
  hideOn: ['save', 'cancel'],
})

function openDraft() {
  draftDialog.show({
    props: {
      initialContent: savedDraft.value,
      onSave: (content: string) => {
        savedDraft.value = content
        ElMessage.success('草稿已保存')
      },
    },
  })
}
</script>

<template>
  <p class="draft-preview">当前草稿：{{ savedDraft }}</p>
  <ElButton type="primary" @click="openDraft">编辑草稿</ElButton>
</template>

<style scoped>
.draft-preview {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 14px;
  line-height: 1.5;
}
</style>
