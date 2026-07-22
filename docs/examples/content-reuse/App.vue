<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useDialog, useDrawer } from '../shared/layers'
import FilterPanel from './FilterPanel.vue'

const activeFilters = ref<string[]>(['active'])

const filterDialog = useDialog(FilterPanel, {
  closeOn: ['apply', 'reset'],
})

const filterDrawer = useDrawer(FilterPanel, {
  closeOn: ['apply', 'reset'],
})

function onApply(status: string[]) {
  activeFilters.value = status
}

function onReset() {
  activeFilters.value = []
}

function buildPayload() {
  return {
    props: {
      initialStatus: activeFilters.value,
      onApply,
      onReset,
    },
  }
}
</script>

<template>
  <div class="reuse">
    <div class="reuse__status">
      <span>当前筛选：</span>
      <ElTag v-for="s in activeFilters" :key="s" size="small">{{ s }}</ElTag>
      <span v-if="!activeFilters.length" class="reuse__empty">（无）</span>
    </div>

    <section class="reuse__block">
      <p class="reuse__label">页内嵌入同一 FilterPanel</p>
      <FilterPanel
        :initial-status="activeFilters"
        @apply="onApply"
        @reset="onReset"
      />
    </section>

    <div class="reuse__actions">
      <ElButton type="primary" @click="filterDialog.open(buildPayload())">
        Dialog 打开
      </ElButton>
      <ElButton type="primary" plain @click="filterDrawer.open(buildPayload())">
        Drawer 打开
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.reuse__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.reuse__empty {
  color: var(--el-text-color-placeholder);
}

.reuse__block {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.reuse__label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.reuse__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
