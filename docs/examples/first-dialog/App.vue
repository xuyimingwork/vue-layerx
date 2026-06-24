<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import ConfirmDialog from './ConfirmDialog.vue'

const confirm = useDialog(ConfirmDialog)

function askDelete() {
  confirm.open({
    props: {
      onConfirm: () => ElMessage.success('已删除'),
    },
  })
}
</script>

<template>
  <p class="hint">业务页没有 <code>el-dialog</code>、没有 <code>v-model</code>、没有 <code>closeOn</code>。</p>
  <ElButton type="danger" @click="askDelete">删除记录</ElButton>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}
</style>
