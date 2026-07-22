<script setup lang="ts">
import { ElButton, ElTag } from 'element-plus'
import { LayerTemplate } from 'vue-layerx'
import { useDialog } from '../shared/layers'
import HelloContent from './HelloContent.vue'

const dialog = useDialog(HelloContent)
</script>

<template>
  <ElButton type="primary" @click="dialog.open()">打开弹层</ElButton>

  <!-- 调用方 → 内容组件的 #header -->
  <LayerTemplate :to="dialog" name="header">
    <ElTag type="success" size="small" effect="plain">调用方注入的 header</ElTag>
  </LayerTemplate>
</template>
