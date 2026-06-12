<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from '../../core/layers'
import HelloContent from './HelloContent.vue'

const helloDialog = useDialog(HelloContent, {
  hideOn: ['close'],
})
</script>

<template>
  <ElButton type="primary" @click="helloDialog.show()">打开弹层</ElButton>
</template>
