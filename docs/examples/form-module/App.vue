<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTable, ElTableColumn, ElMessage } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import UserFormDialog from './UserFormDialog.vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

const userForm = useDialog(UserFormDialog)

function openCreate() {
  userForm.open({
    props: {
      mode: 'create',
      onSubmit: (name: string) => {
        const id = users.value.length
          ? Math.max(...users.value.map((u) => u.id)) + 1
          : 1
        users.value.push({ id, name })
        ElMessage.success(`已创建 ${name}`)
      },
    },
  })
}

function openEdit(row: User) {
  userForm.open({
    props: {
      mode: 'edit',
      recordId: row.id,
      initialName: row.name,
      onSubmit: (name: string) => {
        row.name = name
        ElMessage.success('已保存')
      },
    },
  })
}
</script>

<template>
  <p class="hint">
    列表页只关心<strong>何时打开</strong>和<strong>提交后做什么</strong>。取消在
    <code>AppDialog</code>，主操作和 <code>closeOn</code> 在 <code>UserFormDialog</code>。
  </p>

  <header class="toolbar">
    <ElButton type="primary" @click="openCreate">新建用户</ElButton>
  </header>

  <ElTable :data="users" stripe>
    <ElTableColumn prop="id" label="ID" width="80" />
    <ElTableColumn prop="name" label="姓名" />
    <ElTableColumn label="操作" width="120">
      <template #default="{ row }">
        <ElButton link type="primary" @click="openEdit(row)">编辑</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<style scoped>
.hint {
  margin: 0 0 16px;
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

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
