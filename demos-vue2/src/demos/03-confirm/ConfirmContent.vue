<script setup lang="ts">
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  (e: 'confirm', payload: { action: string }): void
  (e: 'cancel'): void
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
  <div>
    <p class="body">确定删除这条记录吗？此操作不可撤销。</p>

    <LayerTemplate :to="layer" name="footer">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="danger" @click="emit('confirm', { action: 'delete' })">
        删除
      </el-button>
    </LayerTemplate>
  </div>
</template>

<style scoped>
.body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--pg-muted);
}
</style>
