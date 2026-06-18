<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../.vitepress/shared/layers'
import DetailContent from './DetailContent.vue'

const user = {
  name: 'Alice',
  email: 'alice@example.com',
  role: '管理员',
}

const baseDetail = useDialog(DetailContent, { hideOn: ['close'] })

const wideDetail = baseDetail.clone({
  container: { props: { width: '640px', title: '用户详情（宽屏）' } },
})

const exportDetail = baseDetail.clone({
  container: { props: { width: '400px', title: '导出预览' } },
})

function openBase() {
  baseDetail.show({
    props: { ...user, onClose: () => ElMessage.info('基础详情已关闭') },
  })
}

function openWide() {
  wideDetail.show({ props: user })
}

function openExport() {
  exportDetail.show({
    props: { ...user, role: `${user.role} · 可导出` },
  })
}
</script>

<template>
  <div class="actions">
    <ElButton @click="openBase">基础详情（480px）</ElButton>
    <ElButton @click="openWide">宽屏详情（clone 640px）</ElButton>
    <ElButton @click="openExport">导出预览（clone 改标题）</ElButton>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
