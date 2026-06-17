<script setup lang="ts">
import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import { useDetailLayer } from '../../../.vitepress/shared/layers'
import UserDetail from '../../tutorial/UserDetail.vue'

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

const detailLayer = useDetailLayer(UserDetail)

function openDetail(row: User) {
  detailLayer.show({ props: row })
}
</script>

<template>
  <p class="hint">点姓名打开详情——列表页<strong>没有</strong> <code>el-dialog</code> 模板。</p>
  <ElTable :data="users" stripe>
    <ElTableColumn prop="id" label="ID" width="72" />
    <ElTableColumn label="姓名">
      <template #default="{ row }">
        <ElButton link type="primary" @click="openDetail(row)">{{ row.name }}</ElButton>
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
