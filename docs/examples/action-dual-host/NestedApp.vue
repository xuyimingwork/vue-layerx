<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { useDialog } from '../shared/layers'
import ReviewPanel from './ReviewPanel.vue'

const dialog = useDialog(ReviewPanel)

function onApprove() {
  ElMessage.success('已通过')
}

function onReject() {
  ElMessage.warning('已驳回')
}

function onDefer() {
  ElMessage.info('已暂缓')
}

function openLayer() {
  dialog.open({
    props: {
      name: '李四',
      onApprove,
      onReject,
      onDefer,
    },
  })
}
</script>

<template>
  <section class="block">
    <p class="label">同一 ReviewPanel · 页内（侧栏式操作区）</p>
    <ReviewPanel
      name="张三"
      @approve="onApprove"
      @reject="onReject"
      @defer="onDefer"
    />
  </section>

  <ElButton type="primary" @click="openLayer">弹层打开（footer 横排）</ElButton>
</template>

<style scoped>
.block {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
</style>
