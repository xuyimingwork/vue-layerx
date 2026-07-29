<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElRadioButton, ElRadioGroup, ElTag } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

type SlotName = 'header' | 'footer'

const emit = defineEmits<{
  close: []
}>()

const slotName = ref<SlotName>('footer')

const layer = defineLayer({
  props: { title: '切 slot 演示' },
  content: { closeOn: ['close'] },
})
</script>

<template>
  <p class="message">
    弹层打开后切换目标插槽：同一块
    <code>LayerTemplate :name</code> 在 <code>visible</code> 时 dispose
    再重绑，绿标会在 Dialog 的 header / footer 间移动。
  </p>

  <ElRadioGroup v-model="slotName" size="small">
    <ElRadioButton value="header">header</ElRadioButton>
    <ElRadioButton value="footer">footer</ElRadioButton>
  </ElRadioGroup>

  <ElButton type="primary" @click="emit('close')">关闭</ElButton>

  <LayerTemplate :to="layer" :name="slotName">
    <ElTag type="success" size="small">动态 → {{ slotName }}</ElTag>
  </LayerTemplate>
</template>

<style scoped>
.message {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.message code {
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--el-fill-color-light);
  font-size: 12px;
}

.el-radio-group {
  display: flex;
  margin-bottom: 12px;
}

.el-button {
  margin-bottom: 4px;
}
</style>
