<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { defineLayer } from 'vue-layerx'

defineProps<{
  name: string
  email: string
  role: string
}>()

defineLayer({
  props: {
    title: '用户详情',
    width: '420px',
    size: '85vw',
    direction: 'rtl',
  },
})
</script>

<template>
  <ElDescriptions :column="1" border size="small">
    <ElDescriptionsItem label="姓名">{{ name }}</ElDescriptionsItem>
    <ElDescriptionsItem label="邮箱">{{ email }}</ElDescriptionsItem>
    <ElDescriptionsItem label="角色">{{ role }}</ElDescriptionsItem>
  </ElDescriptions>
</template>
