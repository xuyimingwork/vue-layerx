<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  mode?: 'create' | 'edit'
  initialName?: string
}>()

const emit = defineEmits<{
  success: [name: string]
}>()

const name = ref(props.initialName ?? '')

const layer = defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户（已拆分）' : '新建用户（已拆分）',
  },
  content: { closeOn: ['success'] },
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
</script>

<template>
  <ElForm label-width="72px" @submit.prevent="submit">
    <ElFormItem label="姓名">
      <ElInput v-model="name" placeholder="请输入姓名" autofocus />
    </ElFormItem>
  </ElForm>

  <LayerTemplate :to="layer" name="footer">
    <ElButton type="primary" @click="submit">保存</ElButton>
  </LayerTemplate>
</template>
