<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const saved = ref('Bob')

const userForm = useDialog(UserForm)

function onInlineSubmit(name: string) {
  saved.value = name
  ElMessage.success(`页内保存：${name}`)
}

function openInDialog() {
  userForm.show({
    props: {
      mode: 'edit',
      initialName: saved.value,
      onSubmit: (name: string) => {
        saved.value = name
        ElMessage.success(`弹层保存：${name}`)
      },
    },
  })
}
</script>

<template>
  <p class="hint">
    <code>visible-outside</code>：页内 footer 在表单下，弹层时挂到 BaseDialog 右侧——组件仍叫
    <code>UserForm</code>。
  </p>
  <UserForm mode="edit" :initial-name="saved" @submit="onInlineSubmit" />
  <ElButton class="open-btn" link type="primary" @click="openInDialog">
    换成弹层编辑 →
  </ElButton>
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

.open-btn {
  margin-top: 4px;
}
</style>
