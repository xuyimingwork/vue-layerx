<script setup lang="ts">
import { ElButton, ElTag } from 'element-plus'
import { useDialog } from '../shared/layers'
import UserDetail from './UserDetail.vue'

const pageDialog = useDialog(UserDetail)

function openAlice() {
  pageDialog.open({
    props: { userId: 'alice', depth: 1 },
  })
}
</script>

<template>
  <div class="nested">
    <ol class="nested__steps">
      <li>下方是 Alice 的<strong>页内</strong>详情。</li>
      <li>点好友 → 打开详情<strong>弹层</strong>。</li>
      <li>弹层里再点好友 → 再叠一层。</li>
    </ol>

    <div class="nested__page">
      <div class="nested__page-head">
        <span>页内详情</span>
        <ElTag size="small" type="success" effect="plain">非弹层</ElTag>
      </div>
      <UserDetail user-id="alice" :depth="0" />
    </div>

    <ElButton type="primary" plain @click="openAlice">或从页面直接打开 Alice 弹层</ElButton>
  </div>
</template>

<style scoped>
.nested__steps {
  margin: 0 0 16px;
  padding-left: 1.25rem;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.nested__page {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.nested__page-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>
