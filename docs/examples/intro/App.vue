<script setup lang="ts">
import { ElButton } from 'element-plus'
import { useDialog } from './layers'
import HelloWorld from './HelloWorld.vue'

const dialog = useDialog(HelloWorld)
</script>

<template>
  <ElButton type="primary" @click="dialog.open()">dialog.open()</ElButton>
</template>
