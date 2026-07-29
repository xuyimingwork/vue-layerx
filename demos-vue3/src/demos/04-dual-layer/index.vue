<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useDialog, useDrawer } from '../../core/layers'
import FilterContent from './FilterContent.vue'

const activeFilters = ref<string[]>(['active'])

const filterDialog = useDialog(FilterContent, {
  closeOn: ['apply', 'reset'],
})

const filterDrawer = useDrawer(FilterContent, {
  closeOn: ['apply', 'reset'],
})

function buildPayload() {
  return {
    props: {
      initialStatus: activeFilters.value,
      onApply: (status: string[]) => {
        activeFilters.value = status
      },
      onReset: () => {
        activeFilters.value = []
      },
    },
  }
}

function openDialog() {
  filterDialog.open(buildPayload())
}

function openDrawer() {
  filterDrawer.open(buildPayload())
}
</script>

<template>
  <div class="dual-layer">
    <div class="dual-layer__status">
      <span>当前筛选：</span>
      <ElTag v-for="s in activeFilters" :key="s" size="small">{{ s }}</ElTag>
      <span v-if="!activeFilters.length" class="empty">（无）</span>
    </div>
    <div class="dual-layer__actions">
      <ElButton type="primary" @click="openDialog">Dialog 打开</ElButton>
      <ElButton type="primary" plain @click="openDrawer">Drawer 打开</ElButton>
    </div>
  </div>
</template>

<style scoped>
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
  flex-wrap: wrap;
  gap: 8px;
}
</style>
