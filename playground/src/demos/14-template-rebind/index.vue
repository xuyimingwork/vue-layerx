<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from '../../core/layers'
import PanelContent from './PanelContent.vue'

const dialog = useDialog(PanelContent)
</script>

<template>
  <p class="hint">
    打开后在<strong>弹层内容里</strong>切换 header / footer：可见状态下改
    <code>:name</code>，观察容器插槽重绑。
  </p>

  <ElButton type="primary" @click="dialog.open()">打开弹层</ElButton>
</template>

<style scoped>
.hint {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.hint code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}
</style>
