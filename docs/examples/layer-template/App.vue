<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from '../shared/layers'
import HelloContent from './HelloContent.vue'

const dialog = useDialog(HelloContent)
</script>

<template>
  <ElButton type="primary" @click="dialog.open()">打开弹层</ElButton>
</template>
