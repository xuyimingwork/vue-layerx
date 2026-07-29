<script setup lang="ts">
import { ElButton, ElTag } from 'element-plus'
import { useDialog } from '../../core/layers'
import UserDetail from './UserDetail.vue'

/** 页面侧也可直接打开详情弹层（与「页内点好友」殊途同归） */
const pageDialog = useDialog(UserDetail)

function openAliceInDialog() {
  pageDialog.open({
    props: { userId: 'alice', depth: 1 },
  })
}
</script>

<template>
  <div class="nested-self">
    <p class="nested-self__intro">
      同一 <code>UserDetail</code>：页内嵌入、弹层打开、弹层内再开一层。content 用
      <code>getCurrentInstance()!.type</code> + <code>useDialog(Self)</code>
      避开自引用循环依赖；每一层 setup 各自持有独立 instance，可继续叠好友详情。
    </p>

    <ol class="nested-self__steps">
      <li>下方是 Alice 的<strong>页内</strong>详情（<code>depth=0</code>，非 layer）。</li>
      <li>点好友 Bob → 打开详情<strong>弹层</strong>（<code>depth=1</code>）。</li>
      <li>在 Bob 弹层里点 Dave → 再叠一层详情弹层（<code>depth=2</code>）。</li>
    </ol>

    <div class="nested-self__page">
      <div class="nested-self__page-head">
        <span>页内详情</span>
        <ElTag size="small" type="success" effect="plain">普通内容 · 非弹层</ElTag>
      </div>
      <UserDetail user-id="alice" :depth="0" />
    </div>

    <ElButton type="primary" plain @click="openAliceInDialog">
      或从页面直接打开 Alice 弹层
    </ElButton>
  </div>
</template>

<style scoped>
.nested-self__intro {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.nested-self__intro code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.nested-self__steps {
  margin: 0 0 16px;
  padding-left: 1.25rem;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.nested-self__page {
  margin-bottom: 12px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.nested-self__page-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>
