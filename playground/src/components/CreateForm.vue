<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { LayerSlot } from 'vue-layerx'
import { useDialog } from '../layers'

const props = defineProps<{
  mode?: 'create' | 'edit'
  recordId?: number
  initialName?: string
}>()

const emit = defineEmits<{
  success: [name: string]
  cancel: []
}>()

const name = ref(props.initialName ?? '')
const footerRef = ref()

useDialog.layer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
  },
  slots: { footer: footerRef },
})

watch(
  () => props.initialName,
  (value) => {
    if (value !== undefined) name.value = value
  },
)

function submit() {
  if (!name.value.trim()) return
  emit('success', name.value.trim())
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <ElForm label-width="72px" @submit.prevent="submit">
    <ElFormItem>
      <slot name="header">
        <span class="form-header">请填写用户信息</span>
      </slot>
    </ElFormItem>
    <ElFormItem v-if="recordId" label="ID">
      <span>{{ recordId }}</span>
    </ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="name" placeholder="请输入姓名" />
    </ElFormItem>
  </ElForm>

  <LayerSlot ref="footerRef">
    <ElButton type="primary" @click="submit">
      {{ mode === 'edit' ? '保存' : '创建' }}
    </ElButton>
    <ElButton @click="cancel">取消</ElButton>
  </LayerSlot>
</template>

<style scoped>
.form-header {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
