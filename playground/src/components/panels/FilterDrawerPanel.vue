<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { useDrawer } from '../../layers'
import FilterForm from '../contents/FilterForm.vue'

const activeFilters = ref<string[]>(['active'])

const filterDrawer = useDrawer(FilterForm, {
  hideOn: ['apply', 'reset'],
})

function openFilter() {
  filterDrawer.show({
    props: {
      initialStatus: activeFilters.value,
      onApply: (status: string[]) => {
        activeFilters.value = status
      },
      onReset: () => {
        activeFilters.value = []
      },
    },
  })
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-panel__bar">
      <span>当前筛选：</span>
      <ElTag v-for="s in activeFilters" :key="s" size="small">{{ s }}</ElTag>
      <span v-if="!activeFilters.length" class="empty">（无）</span>
      <ElButton type="primary" plain @click="openFilter">打开筛选 Drawer</ElButton>
    </div>
  </div>
</template>

<style scoped>
.filter-panel__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.empty {
  color: var(--el-text-color-placeholder);
}
</style>
