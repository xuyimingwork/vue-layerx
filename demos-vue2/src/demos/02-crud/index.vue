<script setup lang="ts">
import { ref } from 'vue'
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '../../core/layers'
import UserForm from './UserForm.vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

const userDialog = useDialog(UserForm, {
  closeOn: ['success', 'cancel'],
})

function openCreate() {
  userDialog.open({
    props: {
      mode: 'create',
      onSuccess: (name: string) => {
        const id = users.value.length
          ? Math.max(...users.value.map((u) => u.id)) + 1
          : 1
        users.value.push({ id, name })
      },
    },
  })
}

function openEdit(row: User) {
  userDialog.open({
    props: {
      mode: 'edit',
      recordId: row.id,
      initialName: row.name,
      onSuccess: (name: string) => {
        row.name = name
      },
    },
  })
}
</script>

<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">新建用户</el-button>
    </div>

    <el-table :data="users" stripe border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="text" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <LayerTemplate :to="userDialog" name="header">
      <el-tag type="success" size="mini">调用方注入 header</el-tag>
    </LayerTemplate>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
