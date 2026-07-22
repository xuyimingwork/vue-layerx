<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from './layers'
import Panel from './Panel.vue'

const dialog = useDialog(Panel)
</script>

<template>
  <div class="demo">
    <Panel />
    <ElButton type="primary" @click="dialog.open()">作为弹层打开</ElButton>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.demo > :last-child {
  align-self: flex-start;
}
</style>
