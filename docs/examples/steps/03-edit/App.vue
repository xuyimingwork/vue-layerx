<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage, ElTable, ElTableColumn } from 'element-plus'
import { useDetailLayer } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

const userLayer = useDetailLayer(UserForm)

function openCreate() {
  userLayer.open({
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
  userLayer.open({
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
    仍是 <code>useDetailLayer</code>——<code>mode: 'edit' | 'create'</code> 时表单可编辑、footer 出现保存按钮。
  </p>
  <header class="toolbar">
    <ElButton type="primary" @click="openCreate">新建</ElButton>
  </header>
  <ElTable :data="users" stripe>
    <ElTableColumn prop="id" label="ID" width="72" />
    <ElTableColumn prop="name" label="姓名" />
    <ElTableColumn label="操作" width="100">
      <template #default="{ row }">
        <ElButton link type="primary" @click="openEdit(row)">编辑</ElButton>
      </template>
    </ElTableColumn>
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

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
