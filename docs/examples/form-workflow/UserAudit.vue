<script setup lang="ts">
import { ref } from 'vue'
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElResult,
} from 'element-plus'
import { useAsync } from 'vue-asyncx'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { auditUserApi, type User } from './api'
import UserForm from './UserForm.vue'

const props = defineProps<{
  userId: number
}>()

const emit = defineEmits<{
  auditDone: [user: User]
  finish: []
}>()

const layer = defineLayer({
  props: {
    title: '审核用户',
  },
  content: {
    // 接口成功 emit auditDone（列表刷新）；点「完成」emit finish 关层
    closeOn: ['finish'],
  },
})

type Phase = 'form' | 'result'
const phase = ref<Phase>('form')
const result = ref<User | null>(null)

function isConfirmCancel(e: unknown) {
  return e === 'cancel' || e === 'close'
}

function auditUser(type: 'approve' | 'reject') {
  return auditUserApi(props.userId, type).then((row) => {
    result.value = row
    phase.value = 'result'
    emit('auditDone', row)
  })
}

const { rejectUser, rejectUserLoading } = useAsync('rejectUser', () =>
  ElMessageBox.confirm('确认驳回该用户？', '二次确认', {
    type: 'warning',
    confirmButtonText: '驳回',
    cancelButtonText: '返回',
  })
    .then(() => auditUser('reject'))
    .then(() => ElMessage.success('已驳回'))
    .catch((e) => {
      if (isConfirmCancel(e)) return
      ElMessage.error(e instanceof Error ? e.message : '审核失败')
    }),
)

const { approveUser, approveUserLoading } = useAsync('approveUser', () =>
  ElMessageBox.confirm('确认通过该用户？', '二次确认', {
    type: 'success',
    confirmButtonText: '通过',
    cancelButtonText: '返回',
  })
    .then(() => auditUser('approve'))
    .then(() => ElMessage.success('已通过'))
    .catch((e) => {
      if (isConfirmCancel(e)) return
      ElMessage.error(e instanceof Error ? e.message : '审核失败')
    }),
)
</script>

<template>
  <template v-if="phase === 'form'">
    <!-- 把 UserForm 当成普通组件使用 -->
    <UserForm :user-id="userId" mode="view" />
  </template>

  <ElResult
    v-else
    :icon="result?.status === 'active' ? 'success' : 'warning'"
    :title="result?.status === 'active' ? '审核通过' : '已驳回'"
    :sub-title="`${result?.name} · ${result?.title}`"
  />

  <!-- 弹层投进壳的 action；页内因 visible-outside 就地渲染。样式两边一致。 -->
  <LayerTemplate :to="layer" name="action" visible-outside>
    <div class="action">
      <template v-if="phase === 'form'">
        <ElButton
          type="warning"
          :loading="rejectUserLoading"
          @click="rejectUser"
        >
          驳回
        </ElButton>
        <ElButton
          type="primary"
          :loading="approveUserLoading"
          @click="approveUser"
        >
          通过
        </ElButton>
      </template>
      <ElButton v-else type="primary" @click="emit('finish')">完成</ElButton>
    </div>
  </LayerTemplate>
</template>

<style scoped>
.action {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
</style>
