<script setup lang="ts">
import { ElButton } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const emit = defineEmits<{
  close: []
}>()

const layer = defineLayer({
  props: { title: 'smoke · open()', width: '420px' },
  content: { closeOn: ['close'] },
})
</script>

<template>
  <p>来自 npm 安装的 <code>vue-layerx</code>，不是 workspace 源码。</p>
  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="emit('close')">关闭</ElButton>
  </LayerTemplate>
</template>
