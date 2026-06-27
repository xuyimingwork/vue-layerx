<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  confirm: []
}>()

const layer = defineLayer({
  props: { title: '删除确认', width: '400px' },
  content: { closeOn: ['confirm'] },
})
</script>

<template>
  <p class="body">确定删除这条记录吗？此操作不可撤销。</p>

  <LayerTemplate :to="layer" name="footer">
    <ElButton type="danger" @click="emit('confirm')">删除</ElButton>
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
