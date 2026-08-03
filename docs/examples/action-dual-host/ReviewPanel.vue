<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  name?: string
}>()

const emit = defineEmits<{
  approve: []
  reject: []
  defer: []
}>()

const layer = defineLayer(() => ({
  props: { title: `审核 · ${props.name ?? '草稿'}`, width: '480px' },
  content: { closeOn: ['approve', 'reject', 'defer'] },
}))

/**
 * 按钮组本身嵌套（主按钮 + 更多），页内 / 弹层还要套不同外壳。
 * 用 createReusableTemplate 只定义一次内层，外壳按 exists 分叉。
 */
const { define: DefineActions, reuse: ReuseActions } = createReusableTemplate()
</script>

<template>
  <p class="body">
    申请人：<ElTag size="small">{{ name ?? '未命名' }}</ElTag>
    · 状态待审
  </p>

  <DefineActions>
    <ElButton @click="emit('reject')">驳回</ElButton>
    <ElDropdown trigger="click" @command="() => emit('defer')">
      <ElButton>更多</ElButton>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem command="defer">暂缓处理</ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>

    <ElButton type="primary" @click="emit('approve')">通过</ElButton>
  </DefineActions>

  <!-- 弹层：平铺进 footer -->
  <LayerTemplate v-if="layer.exists" :to="layer" name="footer">
    <div class="footer-actions">
      <ReuseActions />
    </div>
  </LayerTemplate>

  <!-- 页内：侧栏式工具条，外壳不同、内层按钮组复用 -->
  <aside v-else class="side-panel">
    <p class="side-panel__title">审核操作</p>
    <div class="side-panel__stack">
      <ReuseActions />
    </div>
  </aside>
</template>

<style scoped>
.body {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.footer-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.side-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}

.side-panel__title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.side-panel__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.side-panel__stack :deep(.el-button) {
  width: 100%;
  margin: 0;
}

.side-panel__stack :deep(.el-dropdown) {
  width: 100%;
}

.side-panel__stack :deep(.el-dropdown .el-button) {
  width: 100%;
}
</style>
