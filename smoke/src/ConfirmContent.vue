<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  confirm: [payload: { action: string }]
  cancel: []
}>()

const layer = defineLayer({
  props: { title: 'smoke · confirm()', width: '400px' },
  content: {
    closeOn: {
      confirm: { when: 'always', confirmed: true },
      cancel: { when: 'always', confirmed: false },
    },
  },
})
</script>

<template>
  <p>点「确认」应 resolve；点「取消」或遮罩应 reject。</p>
  <LayerTemplate :to="layer" name="footer">
    <ElButton @click="emit('cancel')">取消</ElButton>
    <ElButton type="danger" @click="emit('confirm', { action: 'ok' })">
      确认
    </ElButton>
  </LayerTemplate>
</template>
