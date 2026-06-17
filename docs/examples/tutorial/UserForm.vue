<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElButton, ElForm, ElFormItem, ElInput } from 'element-plus'
import { defineLayer, LayerTemplate } from 'vue-layerx'

const props = defineProps<{
  mode?: 'create' | 'edit'
  recordId?: number
  initialName?: string
}>()

const emit = defineEmits<{
  submit: [name: string]
}>()

const name = ref(props.initialName ?? '')
const submitting = ref(false)
const snapshot = computed(() => props.initialName ?? '')
const dirty = computed(() => name.value !== snapshot.value)

defineLayer({
  props: {
    title: props.mode === 'edit' ? '编辑用户' : '新建用户',
    beforeClose: (done: () => void) => {
      if (!dirty.value) {
        done()
        return
      }
      if (window.confirm('内容未保存，确定关闭？')) done()
    },
  },
  hideOn: ['submit'],
})

watch(
  () => props.initialName,
  (value) => {
    if (value !== undefined) name.value = value
  },
)

async function handleSubmit() {
  if (!name.value.trim()) return
  submitting.value = true
  await new Promise((r) => setTimeout(r, 300))
  submitting.value = false
  emit('submit', name.value.trim())
}
</script>

<template>
  <ElForm label-width="72px" @submit.prevent="handleSubmit">
    <ElFormItem v-if="recordId" label="ID">
      <span>{{ recordId }}</span>
    </ElFormItem>
    <ElFormItem label="姓名">
      <ElInput v-model="name" placeholder="请输入姓名" autofocus />
    </ElFormItem>
  </ElForm>

  <!-- 弹层模式：保存按钮进 BaseDialog footer（§4 才加 visible-outside） -->
  <LayerTemplate name="footer">
    <ElButton type="primary" :loading="submitting" @click="handleSubmit">
      {{ mode === 'edit' ? '保存' : '创建' }}
    </ElButton>
  </LayerTemplate>
</template>
