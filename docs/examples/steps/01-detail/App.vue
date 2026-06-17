<script setup lang="ts">
import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import { useDetailLayer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

interface User {
  id: number
  name: string
  email: string
  role: string
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: '管理员' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: '成员' },
]

const userLayer = useDetailLayer(UserForm)

function openView(row: User) {
  userLayer.show({
    props: { mode: 'view', recordId: row.id, initialName: row.name, email: row.email, role: row.role },
  })
}
</script>

<template>
  <p class="hint">
    点姓名 → <code>useDetailLayer(UserForm).show({ mode: 'view' })</code>，表单 disabled 只读。
  </p>
  <ElTable :data="users" stripe>
    <ElTableColumn prop="id" label="ID" width="72" />
    <ElTableColumn label="姓名">
      <template #default="{ row }">
        <ElButton link type="primary" @click="openView(row)">{{ row.name }}</ElButton>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="role" label="角色" />
  </ElTable>
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
