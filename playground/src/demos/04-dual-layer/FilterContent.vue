<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElCheckbox, ElCheckboxGroup, ElForm, ElFormItem } from 'element-plus'
import { LayerSlot } from 'vue-layerx'
import { useDialog, useDrawer } from '../../core/layers'

const props = defineProps<{
  initialStatus?: string[]
}>()

const emit = defineEmits<{
  apply: [status: string[]]
  reset: []
}>()

const footerRef = ref()
const status = ref<string[]>([...(props.initialStatus ?? ['active'])])

/**
 * 同时声明两套 layer 配置，共用 footer LayerSlot。
 * 实际渲染时只有与当前 useDialog / useDrawer 匹配的 layer() 会 inject 成功。
 */
useDialog.layer({
  props: { title: '筛选条件', width: '420px' },
  slots: { footer: footerRef },
})

useDrawer.layer({
  props: { title: '筛选条件', size: '360px', direction: 'rtl' },
  slots: { footer: footerRef },
})

function apply() {
  emit('apply', [...status.value])
}

function reset() {
  status.value = []
  emit('reset')
}
</script>

<template>
  <ElForm label-position="top">
    <ElFormItem label="状态">
      <ElCheckboxGroup v-model="status">
        <ElCheckbox value="active">活跃</ElCheckbox>
        <ElCheckbox value="inactive">停用</ElCheckbox>
        <ElCheckbox value="pending">待审核</ElCheckbox>
      </ElCheckboxGroup>
    </ElFormItem>
  </ElForm>

  <LayerSlot ref="footerRef">
    <ElButton type="primary" @click="apply">应用</ElButton>
    <ElButton @click="reset">重置</ElButton>
  </LayerSlot>
</template>
