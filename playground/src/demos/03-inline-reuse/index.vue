<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../core/layers'
import UserForm from '../02-crud/UserForm.vue'

const lastSaved = ref('')

const compareDialog = useDialog(UserForm, {
  hideOn: ['success', 'cancel'],
})

function onInlineSuccess(name: string) {
  lastSaved.value = name
  ElMessage.success(`页内保存：${name}`)
}

function openInDialog() {
  compareDialog.show({
    props: {
      mode: 'create',
      onSuccess: (name: string) => {
        lastSaved.value = name
        ElMessage.success(`弹层保存：${name}`)
      },
    },
  })
}
</script>

<template>
  <div class="inline-reuse">
    <p class="subtitle">页内模式</p>
    <UserForm mode="create" @success="onInlineSuccess" />

    <ElButton class="compare-btn" link type="primary" @click="openInDialog">
      同一表单 · 弹层打开对比 footer
    </ElButton>

    <p v-if="lastSaved" class="result">最近保存：{{ lastSaved }}</p>
  </div>
</template>

<style scoped>
.subtitle {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.compare-btn {
  margin-top: 8px;
}

.result {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--el-color-success);
}
</style>
