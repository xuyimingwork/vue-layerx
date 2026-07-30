<script setup lang="ts">
import { ElButton, ElCard, ElCol, ElRow, ElTable, ElTableColumn, ElTag, ElMessage } from 'element-plus'
import { useAsyncData } from 'vue-asyncx'
import { useDialog, useDrawer } from './layers'
import { getUserListApi, type User } from './api'
import UserForm from './UserForm.vue'
import UserAudit from './UserAudit.vue'

const { users, queryUsers, queryUsersLoading } = useAsyncData(
  'users',
  getUserListApi,
  { initialData: [] as User[], immediate: true },
)

// 本例拆出 userCreate / userEdit / userDetail 三个实例便于对照；
// 也可以只用一个实例，open 时传入 mode。
const userCreate = useDialog(UserForm, {
  props: {
    mode: 'create',
    onCreateDone: () => queryUsers(),
  },
})

const userEdit = useDialog(UserForm, {
  props: {
    mode: 'edit',
    onUpdateDone: () => queryUsers(),
  },
})

const userDetail = useDialog(UserForm, {
  props: { mode: 'view' },
})

const userAudit = useDrawer(UserAudit, {
  props: {
    onAuditDone: () => queryUsers(),
  },
})

function statusType(status: User['status']) {
  if (status === 'active') return 'success'
  if (status === 'rejected') return 'danger'
  return 'info'
}

function statusLabel(status: User['status']) {
  if (status === 'active') return '已通过'
  if (status === 'rejected') return '已驳回'
  return '待审核'
}
</script>

<template>
  <header class="toolbar">
    <ElButton type="primary" @click="userCreate.open()">新增用户</ElButton>
  </header>

  <ElTable v-loading="queryUsersLoading" :data="users" stripe>
    <ElTableColumn prop="id" label="ID" width="64" />
    <ElTableColumn prop="name" label="姓名" />
    <ElTableColumn prop="title" label="职位" />
    <ElTableColumn label="状态" width="100">
      <template #default="{ row }">
        <ElTag size="small" :type="statusType(row.status)" effect="plain">
          {{ statusLabel(row.status) }}
        </ElTag>
      </template>
    </ElTableColumn>
    <ElTableColumn label="操作" width="220">
      <template #default="{ row }">
        <ElButton
          link
          type="primary"
          @click="userDetail.open({ props: { userId: row.id } })"
        >
          详情
        </ElButton>
        <ElButton
          link
          type="primary"
          @click="userEdit.open({ props: { userId: row.id } })"
        >
          编辑
        </ElButton>
        <ElButton
          link
          type="warning"
          :disabled="row.status !== 'draft'"
          @click="userAudit.open({ props: { userId: row.id } })"
        >
          审核
        </ElButton>
      </template>
    </ElTableColumn>
  </ElTable>

  <section class="inline-list">
    <p class="inline-list__label">页内平铺审核</p>
    <ElRow :gutter="12">
      <ElCol v-for="u in users" :key="u.id" :span="12">
        <ElCard class="inline-card" shadow="never">
          <template #header>
            {{ u.name }} · {{ u.title }}
            <ElTag size="small" :type="statusType(u.status)" effect="plain">
              {{ statusLabel(u.status) }}
            </ElTag>
          </template>
          <UserAudit :user-id="u.id" @audit-done="queryUsers()" @finish="ElMessage.warning('点击完成')" />
        </ElCard>
      </ElCol>
    </ElRow>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.inline-list {
  margin-top: 16px;
}

.inline-list__label {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.inline-card {
  margin-bottom: 12px;
}

.inline-card :deep(.el-card__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
</style>
