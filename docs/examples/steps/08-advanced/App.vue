<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage, ElTag } from 'element-plus'
import { useDialog } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

const user = ref({ id: 1, name: 'Alice' })

const editForm = useDialog(UserForm)
const viewForm = editForm.clone({
  container: { props: { width: '400px' } },
})

function openEdit() {
  editForm.open({
    props: {
      mode: 'edit',
      recordId: user.value.id,
      initialName: user.value.name,
      onSubmit: (name: string) => {
        user.value.name = name
        ElMessage.success('已保存')
      },
    },
  })
}

function openView() {
  viewForm.open({
    props: {
      mode: 'view',
      recordId: user.value.id,
      initialName: user.value.name,
    },
    container: { props: { title: '快速预览（open 覆盖标题）' } },
  })
}
</script>

<template>
  <p class="hint">
    <code>clone()</code> 派生只读预览实例；<code>show({ container })</code> 单次覆盖标题——配置优先级：
    show &gt; clone &gt; define。
  </p>
  <p class="user">
    {{ user.name }}
    <ElTag size="small" type="info">ID {{ user.id }}</ElTag>
  </p>
  <div class="actions">
    <ElButton type="primary" @click="openEdit">编辑</ElButton>
    <ElButton @click="openView">只读预览 <ElTag size="small">clone + show</ElTag></ElButton>
  </div>
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

.user {
  margin: 0 0 12px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
