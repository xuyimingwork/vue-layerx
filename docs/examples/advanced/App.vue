<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import DraftDialog from './DraftDialog.vue'
import DetailContent from './DetailContent.vue'

const savedDraft = ref('欢迎使用 vue-layerx')

const draft = useDialog(DraftDialog)
const baseDetail = useDialog(DetailContent)
const wideDetail = baseDetail.clone({
  container: { props: { width: '640px', title: '用户详情（宽屏）' } },
})

const user = { name: 'Alice', email: 'alice@example.com', role: '管理员' }

function openDraft() {
  draft.show({
    props: {
      initialContent: savedDraft.value,
      onSubmit: (content: string) => {
        savedDraft.value = content
        ElMessage.success('草稿已保存')
      },
    },
  })
}

function openDetail() {
  baseDetail.show({ props: user })
}

function openWideDetail() {
  wideDetail.show({ props: user })
}
</script>

<template>
  <section class="section">
    <h4>未保存拦截</h4>
    <p class="draft-preview">{{ savedDraft }}</p>
    <ElButton type="primary" @click="openDraft">编辑草稿</ElButton>
  </section>

  <section class="section">
    <h4>clone 派生宽屏版</h4>
    <p class="hint">同一 <code>DetailContent</code>，base 480px，clone 出 640px 变体——调用方零改动。</p>
    <div class="actions">
      <ElButton @click="openDetail">标准详情</ElButton>
      <ElButton @click="openWideDetail">宽屏详情 <ElTag size="small" type="info">clone</ElTag></ElButton>
    </div>
  </section>
</template>

<style scoped>
.section + .section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.section h4 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
}

.hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.draft-preview {
  margin: 0 0 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
