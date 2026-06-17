<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElCheckbox, ElCheckboxGroup, ElForm, ElFormItem } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  initialStatus?: string[]
}>()

const emit = defineEmits<{
  apply: [status: string[]]
  reset: []
}>()

const status = ref<string[]>([...(props.initialStatus ?? ['active'])])

defineLayer({
  props: {
    title: '筛选条件',
    width: '420px',
    direction: 'rtl',
  },
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

  <LayerTemplate name="footer">
    <ElButton type="primary" @click="apply">应用</ElButton>
    <ElButton @click="reset">重置</ElButton>
  </LayerTemplate>
</template>
