<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  confirm: [payload: { action: string }]
  cancel: []
}>()

const layer = defineLayer({
  props: { title: '删除确认', width: '400px' },
  content: {
    closeOn: {
      confirm: { when: 'always', confirmed: true },
      cancel: { when: 'always', confirmed: false },
    },
  },
})
</script>

<template>
  <p class="body">确定删除这条记录吗？此操作不可撤销。</p>

  <LayerTemplate :to="layer" name="footer">
    <ElButton @click="emit('cancel')">取消</ElButton>
    <ElButton type="danger" @click="emit('confirm', { action: 'delete' })">
      删除
    </ElButton>
  </LayerTemplate>
</template>

<style scoped>
.body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
