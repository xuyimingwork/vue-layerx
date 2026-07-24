<script setup lang="ts">
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput } from 'element-plus'
import { ref, watch } from 'vue'
import { defineLayer, LayerNoContainer } from 'vue-layerx'

const props = defineProps<{
  modelValue?: boolean
  title?: string
  width?: string
  mode?: 'create' | 'edit'
  initialName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [name: string]
}>()

/**
 * 单体自报「不要外层 Dialog 壳」。工厂仍是 createLayer(ElDialog)，
 * 同构 Teleport 换壳可 park content（通常只 setup 一次）；首帧仍可能先走 ElDialog。
 */
defineLayer({
  component: LayerNoContainer,
})

console.log('UserDialog setup')

const name = ref(props.initialName ?? '')

watch(
  () => props.initialName,
  (value) => {
    if (value !== undefined) name.value = value
  },
)

function close() {
  emit('update:modelValue', false)
}

function submit() {
  if (!name.value.trim()) return
  emit('success', name.value.trim())
}
</script>

<template>
  <ElDialog
    :model-value="modelValue"
    :title="title ?? (mode === 'edit' ? '编辑用户' : '新建用户')"
    :width="width ?? '480px'"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <ElForm label-width="72px" @submit.prevent="submit">
      <ElFormItem label="姓名">
        <ElInput v-model="name" placeholder="请输入姓名" autofocus />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="close">取消</ElButton>
      <ElButton type="primary" @click="submit">保存</ElButton>
    </template>
  </ElDialog>
</template>
