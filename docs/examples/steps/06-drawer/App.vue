<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog, useDrawer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const name = ref('Alice')

const userDialog = useDialog(UserForm)
const userDrawer = useDrawer(UserForm)

function payload() {
  return {
    props: {
      mode: 'edit' as const,
      initialName: name.value,
      onSubmit: (n: string) => {
        name.value = n
        ElMessage.success('已保存')
      },
    },
  }
}
</script>

<template>
  <p class="hint">
    同一 <code>UserForm</code>：<code>useDialog</code> 走 <code>width</code>，
    <code>useDrawer</code> 走 <code>size</code> + <code>direction</code>——
    <code>adapt</code> 在 <code>layers.ts</code> 里按壳裁剪，表单无感知。
  </p>
  <p class="current">当前姓名：{{ name }}</p>
  <div class="actions">
    <ElButton type="primary" @click="userDialog.open(payload())">Dialog 编辑</ElButton>
    <ElButton type="primary" plain @click="userDrawer.open(payload())">Drawer 编辑</ElButton>
  </div>
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

.current {
  margin: 0 0 12px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
