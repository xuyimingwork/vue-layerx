<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { LayerBind, LayerTemplate } from 'vue-layerx'
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
  hideOn: ['success', 'cancel'],
})

function openCreate() {
  userDialog.show({
    props: {
      mode: 'create',
      onSuccess: (name: string) => {
        const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
        users.value.push({ id, name })
      },
    },
  })
}

function openEdit(row: User) {
  userDialog.show({
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

  <LayerBind :to="userDialog">
    <LayerTemplate name="header">
      <ElTag type="success" size="small">调用方注入 header</ElTag>
    </LayerTemplate>
  </LayerBind>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>
