<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import UserFormDialog from '../form-module/UserFormDialog.vue'

const lastSaved = ref('')

function onInlineSubmit(name: string) {
  lastSaved.value = name
  ElMessage.success(`页内保存：${name}`)
}

const userForm = useDialog(UserFormDialog)

function openInDialog() {
  userForm.open({
    props: {
      mode: 'create',
      onSubmit: (name: string) => {
        lastSaved.value = name
        ElMessage.success(`弹层保存：${name}`)
      },
    },
  })
}
</script>

<template>
  <p class="subtitle">设置页 · 页内编辑（同一套 UserFormDialog）</p>
  <UserFormDialog mode="create" @submit="onInlineSubmit" />

  <ElButton class="compare-btn" link type="primary" @click="openInDialog">
    换成弹层打开 →
  </ElButton>

  <p v-if="lastSaved" class="result">最近保存：{{ lastSaved }}</p>
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
