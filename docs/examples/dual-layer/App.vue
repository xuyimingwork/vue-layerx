<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useDialog, useDrawer } from '../../.vitepress/shared/layers'
import FilterPanel from './FilterPanel.vue'

const activeFilters = ref<string[]>(['active'])

const filterDialog = useDialog(FilterPanel)
const filterDrawer = useDrawer(FilterPanel)

function buildPayload() {
  return {
    props: {
      initialStatus: activeFilters.value,
      onApply: (status: string[]) => {
        activeFilters.value = status
      },
    },
  }
}
</script>

<template>
  <p class="hint">
    <code>FilterPanel</code> 不知道外壳是 Dialog 还是 Drawer——<code>AppDialog</code> /
    <code>AppDrawer</code> 各自内置取消，主操作由模块 <code>LayerTemplate</code> 注入。
  </p>
  <div class="dual-layer__status">
    <span>当前筛选：</span>
    <ElTag v-for="s in activeFilters" :key="s" size="small">{{ s }}</ElTag>
    <span v-if="!activeFilters.length" class="empty">（无）</span>
  </div>
  <div class="dual-layer__actions">
    <ElButton type="primary" @click="filterDialog.show(buildPayload())">Dialog</ElButton>
    <ElButton type="primary" plain @click="filterDrawer.show(buildPayload())">Drawer</ElButton>
  </div>
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

.dual-layer__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.empty {
  color: var(--el-text-color-placeholder);
}

.dual-layer__actions {
  display: flex;
  gap: 8px;
}
</style>
