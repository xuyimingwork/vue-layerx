<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElMessage, ElTable, ElTableColumn, ElTag } from 'element-plus'
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '../../../.vitepress/shared/layers'
import UserForm from '../../tutorial/UserForm.vue'

interface User {
  id: number
  name: string
}

const users = ref<User[]>([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
])

const userForm = useDialog(UserForm)

function openEdit(row: User) {
  userForm.show({
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
    列表页通过 <code>LayerTemplate :to</code> 向 <code>UserForm</code> 的 <code>#header</code>
    插槽注入上下文——不修改表单组件源码。
  </p>

  <ElTable :data="users" stripe>
    <ElTableColumn prop="id" label="ID" width="72" />
    <ElTableColumn prop="name" label="姓名" />
    <ElTableColumn label="操作" width="100">
      <template #default="{ row }">
        <ElButton link type="primary" @click="openEdit(row)">编辑</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>

  <LayerTemplate :to="userForm" name="header">
    <ElTag type="warning" size="small">管理员编辑</ElTag>
  </LayerTemplate>
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
