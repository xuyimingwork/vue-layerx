<script setup lang="ts">
import { ElButton, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'
import { useMyDialog } from './layers'
import PrintPreview from './PrintPreview.vue'

const props = defineProps<{
  orderId: string
  customer: string
  amount: string
  status: string
  createdAt: string
  onDownloaded?: (message: string) => void
}>()

const layer = defineLayer({
  props: {
    title: `订单详情 · ${props.orderId}`,
    width: '520px',
  },
})

/** 详情只打开预览；下载归预览自己 */
const preview = useMyDialog(PrintPreview)

function openPreview() {
  preview.open({
    props: {
      orderId: props.orderId,
      customer: props.customer,
      amount: props.amount,
      onDownloaded: props.onDownloaded,
    },
  })
}
</script>

<template>
  <ElDescriptions :column="1" border size="small">
    <ElDescriptionsItem label="订单号">{{ orderId }}</ElDescriptionsItem>
    <ElDescriptionsItem label="状态">{{ status }}</ElDescriptionsItem>
    <ElDescriptionsItem label="客户">{{ customer }}</ElDescriptionsItem>
    <ElDescriptionsItem label="金额">{{ amount }}</ElDescriptionsItem>
    <ElDescriptionsItem label="创建时间">{{ createdAt }}</ElDescriptionsItem>
  </ElDescriptions>

  <LayerTemplate :to="layer" name="actions">
    <ElButton type="primary" @click="openPreview">打印预览</ElButton>
  </LayerTemplate>
</template>
