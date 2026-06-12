<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../../layers'
import UserDetail from '../contents/UserDetail.vue'

const user = {
  name: 'Alice',
  email: 'alice@example.com',
  role: '管理员',
}

/** 基础实例：窄详情 */
const baseDetail = useDialog(UserDetail, {
  hideOn: ['close'],
})

/** clone：独立 visible，宽屏只读展示 */
const wideDetail = baseDetail.clone({
  layer: { props: { width: '640px', title: '用户详情（宽屏）' } },
})

/** clone：再派生一个导出确认风格 */
const exportDetail = baseDetail.clone({
  layer: { props: { width: '400px', title: '导出预览' } },
})

function openBase() {
  baseDetail.show({
    props: {
      ...user,
      onClose: () => ElMessage.info('基础详情已关闭'),
    },
  })
}

function openWide() {
  wideDetail.show({ props: user })
}

function openExport() {
  exportDetail.show({
    props: {
      ...user,
      role: `${user.role} · 可导出`,
    },
  })
}
</script>

<template>
  <div class="clone-panel">
    <p class="note">
      三个实例共享同一 <code>UserDetail</code>，<code>clone()</code> 后
      <code>visible</code> 独立，可并行打开不同配置的弹层。
    </p>
    <div class="actions">
      <ElButton @click="openBase">基础详情（480px）</ElButton>
      <ElButton @click="openWide">宽屏详情（clone 640px）</ElButton>
      <ElButton @click="openExport">导出预览（clone 改标题）</ElButton>
    </div>
  </div>
</template>

<style scoped>
.note {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.note code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
