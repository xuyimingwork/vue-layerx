<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTable, ElTableColumn } from 'element-plus'
import { useDialog } from '../layers'
import CreateForm from './CreateForm.vue'

interface User {
  id: number
  name: string
}

const CreateUserDialog = useDialog(CreateForm, {
  props: { mode: 'create' as const },
  closeOn: ['success', 'cancel'],
  shellProps: { title: '新建用户' },
})

const EditUserDialog = useDialog(CreateForm, {
  props: { mode: 'edit' as const },
  closeOn: ['success', 'cancel'],
  shellProps: { title: '编辑用户' },
})

const users = ref<User[]>([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

const editingRow = ref<User | null>(null)

function openCreate() {
  CreateUserDialog.show()
}

function openEdit(row: User) {
  editingRow.value = row
  EditUserDialog.show({
    recordId: row.id,
    initialName: row.name,
  })
}

function onSuccess(name: string) {
  if (editingRow.value) {
    editingRow.value.name = name
    editingRow.value = null
    return
  }
  const id = users.value.length
    ? Math.max(...users.value.map((u) => u.id)) + 1
    : 1
  users.value.push({ id, name })
}
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <h1>用户列表</h1>
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

    <CreateUserDialog @success="onSuccess" />
    <EditUserDialog
      :record-id="editingRow?.id"
      :initial-name="editingRow?.name"
      @success="onSuccess"
    />
  </section>
</template>

<style scoped>
.panel {
  max-width: 640px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-header h1 {
  margin: 0;
  font-size: 1.25rem;
}
</style>
