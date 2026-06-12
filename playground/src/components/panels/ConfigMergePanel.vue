<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from '../../layers'
import CreateForm from '../CreateForm.vue'

/**
 * useDialog 级覆盖 width；
 * layer() 提供默认 title；
 * show() 可再覆盖 title / width。
 */
const mergeDialog = useDialog(CreateForm, {
  layer: { props: { width: '520px' } },
  hideOn: ['success', 'cancel'],
})

function openDefault() {
  mergeDialog.show({
    props: { mode: 'create' },
  })
}

function openShowOverride() {
  mergeDialog.show({
    props: { mode: 'create' },
    layer: {
      props: {
        title: 'show() 覆盖标题',
        width: '640px',
      },
    },
  })
}
</script>

<template>
  <div class="merge-panel">
    <p class="note">
      合并优先级：<code>show &gt; useDialog &gt; layer() &gt; createLayerx</code>。
      观察弹层标题与宽度变化。
    </p>
    <div class="actions">
      <ElButton @click="openDefault">
        默认（layer() 标题 + useDialog 520px）
      </ElButton>
      <ElButton type="primary" @click="openShowOverride">
        show() 覆盖（标题 + 640px）
      </ElButton>
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
