<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { LayerSlot } from 'vue-layerx'
import { useDialog } from '../../core/layers'

defineProps<{
  name: string
  email: string
  role: string
}>()

const emit = defineEmits<{
  close: []
}>()

const footerRef = ref()

useDialog.layer({
  props: { title: '用户详情' },
  slots: { footer: footerRef },
})
</script>

<template>
  <ElDescriptions :column="1" border size="small">
    <ElDescriptionsItem label="姓名">{{ name }}</ElDescriptionsItem>
    <ElDescriptionsItem label="邮箱">{{ email }}</ElDescriptionsItem>
    <ElDescriptionsItem label="角色">{{ role }}</ElDescriptionsItem>
  </ElDescriptions>

  <LayerSlot ref="footerRef">
    <ElButton @click="emit('close')">关闭</ElButton>
  </LayerSlot>
</template>
