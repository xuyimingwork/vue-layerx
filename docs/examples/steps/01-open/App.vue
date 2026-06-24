<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const userForm = useDialog(UserForm)

function openCreate() {
  userForm.open({
    props: {
      mode: 'create',
      onSubmit: (name: string) => ElMessage.success(`已创建 ${name}`),
    },
  })
}
</script>

<template>
  <p class="hint">列表页没有 <code>el-dialog</code>，只有 <code>userForm.open()</code>。</p>
  <ElButton type="primary" @click="openCreate">新建用户</ElButton>
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
