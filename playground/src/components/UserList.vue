<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { LayerSlot } from 'vue-layerx'
import { useDialog } from '../layers'
import CreateForm from './CreateForm.vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

/** slots.header → CreateForm 内 #header（表单 slot，非 layer slot） */
const createHeaderRef = ref()

const userDialog = useDialog(CreateForm, {
  slots: { header: createHeaderRef },
  hideOn: ['success', 'cancel'],
})

function openCreate() {
  userDialog.show({
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

    <LayerSlot ref="createHeaderRef">
      <ElTag type="success" size="small">UserList 注入的 header</ElTag>
    </LayerSlot>
  </section>
</template>

<style scoped>
.panel {
  width: 100%;
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
