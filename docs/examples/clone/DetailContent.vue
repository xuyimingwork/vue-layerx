<script setup lang="ts">
import { ElButton, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

defineProps<{
  name: string
  email: string
  role: string
}>()

const emit = defineEmits<{
  close: []
}>()

defineLayer({
  props: { title: '用户详情' },
})
</script>

<template>
  <ElDescriptions :column="1" border size="small">
    <ElDescriptionsItem label="姓名">{{ name }}</ElDescriptionsItem>
    <ElDescriptionsItem label="邮箱">{{ email }}</ElDescriptionsItem>
    <ElDescriptionsItem label="角色">{{ role }}</ElDescriptionsItem>
  </ElDescriptions>

  <LayerTemplate name="footer">
    <ElButton @click="emit('close')">关闭</ElButton>
  </LayerTemplate>
</template>
