<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const draft = ref('Alice')

const userForm = useDialog(UserForm)

function openEdit() {
  userForm.show({
    props: {
      mode: 'edit',
      initialName: draft.value,
      onSubmit: (name: string) => {
        draft.value = name
        ElMessage.success('已保存')
      },
    },
  })
}
</script>

<template>
  <p class="hint">
    修改姓名后，点 X / 遮罩 / BaseDialog「取消」→ <code>beforeClose</code> 在
    <code>UserForm</code> 的 <code>defineLayer</code> 里拦截；点「保存」→
    <code>hideOn: ['submit']</code> 正常关闭。
  </p>
  <p class="draft">当前：{{ draft }}</p>
  <ElButton type="primary" @click="openEdit">编辑</ElButton>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.draft {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 14px;
}
</style>
